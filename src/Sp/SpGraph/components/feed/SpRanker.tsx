import type { UpdateProgressTp } from "../../context";

type SpId = string;

export type DataTp = {
	id: SpId;
	forward: string[];
	backward: string[];
	tp: string;
};

export type ProgressDataItem = {
	history: number[]; 
	curStrike: number; 
};

export const calculateScore=(data:any,b:number): number=>{
	if (!data||!data.history||data.history.length < 2)
		return -1;
	
	const history = data.history;
	const firstRepTime = history[0];
	const lastRepTime = history[history.length - 1];

	const a = (lastRepTime - firstRepTime);
	let x = (Date.now() - lastRepTime);
	if (x <= 10) {
		x=10;
	}
	const score = (a * b) / (2 * x);
	return score;
}

export type ProgressTp = {
	[key: SpId]: {
		data: ProgressDataItem;
		float: number; 
	}
};

export type RankerHyperparameters = {
	b: number; // Глобальный гиперпараметр для кривой забывания
	t: number; // Порог "выучивания" (количество правильных ответов подряд)
	k: number; // Размер пакета (batch size), возвращаемого getNextBatch
};

type GraphNode = {
	id: SpId;
	prerequisites: Set<SpId>;
	successors: Set<SpId>;
};

const HOURS_TO_MS = 60 * 60 * 1000;

export function getAgo(ms: any) {	
	const hs = Math.floor(ms / HOURS_TO_MS);
	const mins = Math.floor(ms*60 / HOURS_TO_MS);
	const ss = Math.floor(ms*3600 / HOURS_TO_MS);

	if (hs < 1 && mins < 1 && ss < 1) {
		return 'recently'
	}
	else if (hs < 1 && mins < 1) {
		return ss + 's ago'
	}
	else if (hs < 1) {
		return mins + 'm ago'
	}
	if (hs > 999) {
		return 'long time ago'
	}
	return hs + 'h ago'
}

export class SpRanker {
	private graph: Map<SpId, GraphNode> = new Map();
	// Предрасчитанные полные цепочки зависимостей для каждой карты
	private allPrerequisites: Map<SpId, Set<SpId>> = new Map();
	// Карты, доступные для изучения (нет невыученных зависимостей)
	private availableCards: Set<SpId>=new Set();
	private setProgress: any;
	private blocksHistory: any;

	private progress: ProgressTp;
	private hyperparameters: RankerHyperparameters;

	private cards: Map<string,any>;

	constructor(
		cs: DataTp[], 
		progress: ProgressTp, 
		setProgress:any,
		blocksHistory:any,
		hyperparameters: RankerHyperparameters,
	) {
		this.progress = progress;
		this.setProgress=setProgress;
		this.hyperparameters = hyperparameters;
		this._buildGraph(cs);
		this.cards = new Map(cs.map((card:DataTp)=>{
			// console.log('card',card)
			if (!card.tp) {
				card.tp='Def';
			}
			return [card.id, card]
		}));
		this._calculateAllPrerequisites();
		this._initializeAvailableCards();
		this.blocksHistory=blocksHistory;
	}

	/**
	 * Парсит карты и строит направленный граф зависимостей.
	 */
	private _buildGraph(cs: DataTp[]): void {
		const idRegex = /<id=([^>]+)>/g;
		// Инициализация узлов
		cs.forEach(card => {
			this.graph.set(card.id,{
				id: card.id,
				prerequisites: new Set(),
				successors: new Set(),
			});
		});
		cs.map((c:any)=>{
			if(this.progress[c.id]===undefined){
				this._trackCard(c.id);
			}
		})
		cs.forEach(card => {
			const content = card.forward.join(' ') + ' ' + card.backward.join(' ');
			let match;
			while ((match = idRegex.exec(content)) !== null) {
				const prereqId = match[1];
				const currentNode = this.graph.get(card.id);
				const prereqNode = this.graph.get(prereqId);

				if (currentNode && prereqNode) {
					currentNode.prerequisites.add(prereqId);
					prereqNode.successors.add(card.id);
				}
			}
		});
	}

	private _calculateAllPrerequisites(): void {
		const _getRecursivePrereqs=(id: SpId, visited: Set<SpId>):Set<SpId>=>{
			if (this.allPrerequisites.has(id)) {
				return this.allPrerequisites.get(id)!;
			}
			if (visited.has(id)) {
				return new Set();
			}
			visited.add(id);

			const node = this.graph.get(id)!;
			const prereqs = new Set(node.prerequisites);

			for (const prereqId of node.prerequisites) {
				const deeperPrereqs = _getRecursivePrereqs(prereqId, new Set(visited));
				deeperPrereqs.forEach(p => prereqs.add(p));
			}
			return prereqs;
		}

		for (const id of this.graph.keys()) {
			this.allPrerequisites.set(id, _getRecursivePrereqs(id, new Set()));
		}
	}


	/**
	 * Определяет начальный пул доступных карт:
	 * - "Листья" графа (нет зависимостей).
	 * - Карты, все зависимости которых уже выучены согласно initialProgress.
	 */
	private _initializeAvailableCards(): void {
		for (const [id, node] of this.graph.entries()) {
			const prereqs = Array.from(node.prerequisites);
			const allPrereqsLearned = prereqs.every(prereqId => this._isLearned(prereqId));
				
			if (allPrereqsLearned) {
				this.availableCards.add(id);
			}
		}
	}
	
	/**
	 * Проверяет, выучена ли карта.
	 */
	private _isLearned(id: SpId): boolean {
		const progressData = this.progress[id]?.data;
		return (progressData?.curStrike ?? 0) >= this.hyperparameters.t;
	}

	getNextBatchTp(forbiddenTypes:string[]):string|undefined {
		let prevTp:string|undefined=undefined
		const s = new Set(forbiddenTypes)
		if (this.blocksHistory.length === 0) {
			if (s.has('Def') && !s.has('Th')) {
				return 'Th'
			} else if (s.has('Th')) {
				return 'Task'
			}
			return 'Def';
		}

		if (this.blocksHistory.length > 0){
			prevTp=this.blocksHistory[this.blocksHistory.length-1]
		}

		if (prevTp==='Task'){
			if (s.has('Def') && !s.has('Th')) {
				return 'Th'
			} else if (s.has('Th')) {
				return 'Task'
			}
			return 'Def';
		}

		if(
			prevTp==='Def'&&
			forbiddenTypes.filter((el:string)=>el==='Th').length===0
		){
			return 'Th';
		}
		
		if(
			(prevTp==='Th'||prevTp==='Def')&&
			forbiddenTypes.filter((el:string)=>el==='Task').length===0
		){
			return 'Task'
		}

		return 'Def';
	}

	/**
	 * Рассчитывает "рейтинг забывания" для карты. Чем меньше значение, тем выше приоритет.
	 */

	/**
	 * Основной метод: выбирает k карт с наилучшим рейтингом и возвращает их вместе с зависимостями.
	 */
	public getNextBatch(): SpId[] {
		if (this.availableCards.size === 0) {
			return [];
		}
	
		let availableCards=[] as any[];
		const forbiddenTypes=[] as string[];
		const finalBatchIds = new Set<SpId>();
		let nextBatchTp='' as string|undefined;

		let i = 0

		while (Array.from(finalBatchIds).length==0){
			i+=1
			if (i == 10){
				break;
			}
			// select type for group of next batch
			nextBatchTp=this.getNextBatchTp(forbiddenTypes);
			availableCards=Array.from(this.availableCards)
			
			availableCards=availableCards.filter((id:any)=>this.cards.get(id).tp===nextBatchTp)
			if (nextBatchTp!==undefined&&(
					forbiddenTypes.length===0||forbiddenTypes.length>0 &&
					forbiddenTypes[forbiddenTypes.length-1] !== nextBatchTp
				)){
				forbiddenTypes.push(nextBatchTp);
			}
			const scoredCards=availableCards.map((id:any)=> ({
				id: id,
				score: calculateScore(this.progress[id].data,this.hyperparameters.b)
			}));
			
			// Сортируем: сначала по score (чем меньше, тем лучше), потом по id для стабильности
			scoredCards.sort((a,b)=>{
				if (a.score !== b.score) {
					return a.score - b.score;
				}
				return String(a.id).localeCompare(String(b.id));
			});
			// Выбираем k лучших карт
			const topK = scoredCards.slice(0,this.hyperparameters.k);
			if (topK.length>0){
				this.progress[topK[0].id].float=topK[0].score
			}
			this.setProgress(JSON.parse(JSON.stringify(this.progress)))
	
			topK.forEach(({ id }) => {
				finalBatchIds.add(id);
				// const prereqs = this.allPrerequisites.get(id) || new Set();
				// prereqs.forEach(pId => finalBatchIds.add(pId));
			});
		}
		return Array.from(finalBatchIds);
	}

	public updateProgress(changes:UpdateProgressTp[]):void {
		changes.map((ch:UpdateProgressTp)=>{
			this._updateProgress(ch.id,ch.result)
		})
	}

	private _trackCard(id:SpId):void{
		this.progress = {
			...this.progress,
			[id]: { data: { history: [], curStrike: 0 }, float: 0 },
		}
		this.progress[id].data.history.push(Date.now())
		this.setProgress(JSON.parse(JSON.stringify(this.progress)))
	}

	/**
	 * Обновляет прогресс карты после ответа пользователя и разблокирует следующие карты, если нужно.
	 */
	public _updateProgress(
		id: SpId,
		isCorrect: boolean
	):void {
		if (!this.progress[id]) {
			this._trackCard(id);
		}
		this.progress[id].data.history.push(Date.now())
		// 2. Обновляем историю и счетчик правильных ответов
		if (isCorrect) {
			this.progress[id].data.curStrike += 1;
		} else {
			this.progress[id].data.curStrike = 0;
		}
		this.setProgress(JSON.parse(JSON.stringify(this.progress)))
		// 3. Проверяем, не выучена ли карта только что
		if (isCorrect && this.progress[id].data.curStrike === this.hyperparameters.t) {
			this._unlockSuccessors(id);
		}
	}

	/**
	 * Проверяет "наследников" выученной карты и добавляет их в пул доступных, если все их зависимости удовлетворены.
	 */
	private _unlockSuccessors(learnedCardId: SpId): void {
		const node = this.graph.get(learnedCardId);
		if (!node) return;

		for (const successorId of node.successors) {
			const successorNode = this.graph.get(successorId)!;
			const allPrereqsLearned = Array.from(successorNode.prerequisites)
				.every(pId => this._isLearned(pId));
			
			if (allPrereqsLearned) {
				this.availableCards.add(successorId);
			}
		}
	}
}