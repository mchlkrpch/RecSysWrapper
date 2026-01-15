import {
	ID,
	Query
} from "appwrite"
import {
	spaced_databases,
	node_data_colleciton_id,
	space_db_id
} from "../../utils/appwrite";
import { getXY_screen } from "../../utils/utils";
import { Informate } from "../../components/info";
import { NAMESPACE_COLLECTION_ID } from "../../utils/appwrite";

const dt = Date.now()



















// for feed & graph
export function nodeColor(tp:string){
	switch(tp){
		default:
			return 'transparent'
	}
}

export function __wrap_data_to_node(data:any): string {
	const [x_coord, y_coord, zoom] = getXY_screen()
	Informate('new cell', 'info')
	const position = { x: Math.round((-x_coord + 400) / zoom) - 100, y:Math.round((-y_coord + 400) / zoom)}
	const newN = {
		id: data.id,
		type: "SpDef",
		position: position,
		data:data,
	}as any;
	return newN
}

export const __fetch = async (collectionId: string, filters: any[])=>{
	if (Date.now() - dt >= 100) {
		const f = async ()=>
			spaced_databases.listDocuments(
				space_db_id, collectionId, [...filters]
			)
	
		return (await f()).documents
	}
}

export const __fetchBriefs=async(n:number)=>{
	return __fetch(
		NAMESPACE_COLLECTION_ID,
		[
			Query.select(['parentId','name','description','nNodes']),
			Query.isNull('parentId'),
			Query.limit(n),
		]
	)
}

export const __fetch_brief = async (gId: string)=>{
	const documents = (await __fetch(
		NAMESPACE_COLLECTION_ID,
		[
			Query.equal('$id',gId),
			Query.select(['parentId','name','description','nNodes','owner','blackList','editors']),
			Query.limit(1),
		]
	))
	if (!documents) {
		return []
	}
	return documents
}

export const __fetch_config = async (gId: string)=>{
	const documents = await __fetch(
		NAMESPACE_COLLECTION_ID,
		[
			Query.equal('$id',gId),
			Query.select(['viewsIds','nodeIds']),
			Query.limit(1),
		]
	)
	if (!documents) {
		return []
	}
	return documents
}


export const __fetch_nodes = async (nodeIds: string[]) => {
    if (nodeIds.length === 0) {
        return [];
    }

    try {
			// 1. Создаем массив промисов. Важно, чтобы async-функция ВОЗВРАЩАЛА результат.
			const promises = nodeIds.map(async (id: string) => {
				// Убрали деструктуризацию [n], так как __fetch, вероятно, возвращает один объект
				const n = await __fetch(
					node_data_colleciton_id,
					[
						Query.equal('$id', id),
					]
				);
				if (n){
					return n[0];
				}
				return null;
			});
			const datas = await Promise.all(promises);

			const filteredDatas = datas.filter(data => data != null);
			return filteredDatas;
    } catch (error) {
			console.error("Ошибка при получении узлов:", error);
			return [];
    }
}

export const __render_brief = async (id: string, g:any) => {
	try {
		const [doc] = (await __fetch_brief(id));
		if (!doc) {
			return undefined
		}
		if (g === undefined) {
			g = {}
		}
		if (doc.parentId===null){
			g.parentId=null;
		} else {
			doc.parentId=[doc.parentId]
		}
		g.name=doc.name;
		g.description=doc.description;
		g.nNodes=doc.nNodes;
		g.owner=doc.owner;
		g.editors=doc.editors;
		g.blackList=doc.blackList;
		return g
	} catch (error) {
		console.error("Failed to fetch doc:", error);
	}
};

export const __render_edit = async (id: string) => {
	try {
		const [doc] = await __fetch_config(id);
		if (!doc) {
			return undefined;
		}
		return doc;
	} catch (e) {
		console.error('error', e)
	}
};


export const __save_config=async(ns:any[],viewId:string)=>{
	const s = new Set();
	ns.map((n:any)=>s.add(n.id))
	const newNs=[] as any;
	ns.map((n:any)=>{
		if (s.has(n.id)){
			newNs.push(n)
			s.delete(n.id)
		}
	})
	const ids = newNs.map((n:any)=>n.id)
	await spaced_databases.updateDocument(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		viewId,
		{
			nodeIds: ids,
			nNodes: ids.length,
		}
	)
}

export const __save_brief=async(
	gId:string,
	name:string,
	description:string
)=>{
	if (!gId) {
		console.error("gId undefined");
		return;
	}

	try {
		await spaced_databases.updateDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			gId,
			{
				name: name,
				description: description,
			}
		);
	} catch (error) {
		console.error("update error", error);
	}
}

export const __save_nodes=async(ns: any[])=>{
	const s = new Set();
	ns.map((n:any)=>s.add(n.id))
	const newNs=[] as any;
	ns.map((n:any)=>{
		if (s.has(n.id)){
			newNs.push(n)
			s.delete(n.id)
		}
	})

	console.log('newNs',newNs)

	newNs.map(async (n: any)=>{
		const response = await spaced_databases.listDocuments(
			space_db_id,
			node_data_colleciton_id,
			[
				Query.equal('$id', n.id),
				Query.limit(1)
			]
		);
		const found = response.documents.length > 0
		if (found){
			await spaced_databases.updateDocument(
				space_db_id,
				node_data_colleciton_id,
				n.id,
				{
					forward: n.data.forward,
					backward: n.data.backward,
					id: n.id,
					tp: n.data.tp,
				}
			)
		}else{
			await spaced_databases.createDocument(
				space_db_id,
				node_data_colleciton_id,
				n.id,
				{
					forward:  n.data.forward,
					backward: n.data.backward,
					id: n.id,
					tp: n.data.tp,
				}
			)
		}
	})
}

export const numberToColor = (value: number): string => {
  // 1. Ограничиваем значение в пределах диапазона [0, 10]
  // Это гарантирует, что мы не выйдем за пределы нашего цветового спектра.
  const clampedValue = Math.min(10, Math.max(0, value));

  // 2. Нормализуем значение в диапазон [0, 1]
  // 0 -> 0, 5 -> 0.5, 10 -> 1
  const normalizedValue = clampedValue / 10;

  // 3. Преобразуем нормализованное значение в оттенок (hue) от 0 (красный) до 120 (зеленый)
  const hue = normalizedValue * 120;

  // 4. Возвращаем цвет в формате HSL
  // Saturation 100% для насыщенного цвета.
  // Lightness 45% для хорошей читаемости (не слишком яркий).
  return `hsl(${hue}, 100%, 45%)`;
};


export const __fetch_views=async(
	viewsIds:string[]|undefined
)=>{
	if(viewsIds&&viewsIds.length>0){
		try {
			const res = __fetch(
				NAMESPACE_COLLECTION_ID,
				[
					Query.contains('$id', viewsIds),
					Query.select(['parentId','name','description','nNodes','nodeIds']),
				]
			)
			return res
		}catch(error){
			console.error(`error: ${error}`)
			return [];
		}
	}
	return [];
}

export const __create_graph=async(
	parentId:string|undefined,
	views:any[]|undefined
)=>{
	if (parentId&&views) {
		const newViewId = ID.unique() as any;
		const newView = {
			nodeIds:[],
			viewsIds:[],
			parentId:parentId,
			name:'new view',
			description:'course description',
			nNodes:0,
			$id:newViewId,
		};
		await spaced_databases.createDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			newViewId,
			newView,
		)

		views.push(newView);
		const viewsIds=views.map((n:any)=>n.$id) as any;
		await spaced_databases.updateDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			parentId,
			{
				viewsIds: viewsIds,
			}
		)
		return views;
	}
}

export const __delete_graph=async(
	id:string,
)=>{
	// delete this view from views of namespace.
	const [doc] = (await spaced_databases.listDocuments(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		[
			Query.select(['parentId']),
			Query.equal('$id', id),
			Query.limit(1)
		]
	)).documents as any;

	const parentId:string=doc.parentId as any;
	const [parentDoc] = (await spaced_databases.listDocuments(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		[
			Query.select(['viewsIds']),
			Query.equal('$id', parentId),
			Query.limit(1)
		]
	)).documents as any;
	const parentViews = parentDoc.viewsIds
	await spaced_databases.updateDocument(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		parentId,
		{
			viewsIds:parentViews.filter((v:any)=>v!==id),
		}
	)

	// delete this view
	await spaced_databases.deleteDocument(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		id,
	)
}








































type DataTp = {
	forward: string[],
	backward: string[],
	id:string,
}

export const __recal__edges=(datas:DataTp[])=>{
	const edgesSet = new Set() as Set<string>;
	const allNodeIds = new Set(datas.map(d => d.id));
	const nodeContent: { [key: string]: string } = {};
	const edges=[]as any;

	datas.forEach(card => {
		const concatenatedString = [...card.forward, ...card.backward].join(' ');
		nodeContent[card.id] = concatenatedString;

		const regex = /<id=(.*?)>/g;
		let match;
		while ((match = regex.exec(concatenatedString)) !== null) {
			const sourceId = match[1];
			if (sourceId) {
				if (!edgesSet.has(`e-${sourceId}-${card.id}`)) {
					edgesSet.add(`e-${sourceId}-${card.id}`)
					allNodeIds.add(sourceId);
					edges.push({
							id: `e-${sourceId}-${card.id}`,
							source: sourceId,
							target: card.id,
							type:'SpEdge',
					});
				}
			}
		}
	});
	return edges;
}

export const __build__graph=(datas:DataTp[])=>{
	const edges: {id:string;source:string;target:string,type:string}[] = [];
	const nodeContent: { [key: string]: string } = {};
	const allNodeIds = new Set(datas.map(d => d.id));

	const edgesSet = new Set() as Set<string>;

	datas.forEach(card => {
		const concatenatedString = [...card.forward, ...card.backward].join(' ');
		nodeContent[card.id] = concatenatedString;

		const regex = /<id=(.*?)>/g;
		let match;
		while ((match = regex.exec(concatenatedString)) !== null) {
			const sourceId = match[1];
			if (sourceId) {
				if (!edgesSet.has(`e-${sourceId}-${card.id}`)) {
					edgesSet.add(`e-${sourceId}-${card.id}`)
					allNodeIds.add(sourceId);
					edges.push({
							id: `e-${sourceId}-${card.id}`,
							source: sourceId,
							target: card.id,
							type:'SpEdge',
					});
				}
			}
		}
	});




	// 2. Расчет позиций узлов
	const positions: { [key: string]: { x: number; y: number } } = {};
	const inDegree: { [key: string]: number } = {};
	const adj: { [key: string]: string[] } = {};

	allNodeIds.forEach(id => {
		inDegree[id] = 0;
		adj[id] = [];
	});

	edges.forEach(edge => {
		if (inDegree[edge.target] !== undefined) {
			inDegree[edge.target]++;
		}
		if (adj[edge.source]) {
			adj[edge.source].push(edge.target);
		}
	});

	const queue: string[] = [];
	allNodeIds.forEach(id => {
		if (inDegree[id] === 0) {
			queue.push(id);
		}
	});

	const levelMap: { [key: number]: string[] } = {};
	let level = 0;

	while (queue.length > 0) {
		const levelSize = queue.length;
		if (!levelMap[level]) {
			levelMap[level] = [];
		}

		for (let i = 0; i < levelSize; i++) {
			const u = queue.shift()!;
			levelMap[level].push(u);

			if (adj[u]) {
				adj[u].forEach(v => {
					if (inDegree[v] !== undefined) {
						inDegree[v]--;
						if (inDegree[v] === 0) {
							queue.push(v);
						}
					}
				});
			}
		}
		level++;
	}

	const ySpacing = 150;
	const xSpacing = 30;

	Object.keys(levelMap).forEach(lvlStr => {
		const currentLevel = parseInt(lvlStr, 10);
		const nodesAtLevel = levelMap[currentLevel];
		const levelWidth = nodesAtLevel.length * xSpacing;
		const startX = -levelWidth / 2;

		nodesAtLevel.forEach((nodeId, index) => {
			positions[nodeId] = {
				x: startX + index * xSpacing,
				y: currentLevel * ySpacing,
			};
		});
	});


	// Для узлов, которые могли остаться (в случае циклов)
	allNodeIds.forEach(id => {
		if (!positions[id]) {
			positions[id] = { x: Math.random() * 400, y: Math.random() * 400 };
		}
	});
	return [positions,edges]
}

import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
 
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
export const NodeWidth = 258;
export const NodeHeight = 40;

const getLayoutedElements = (nodes:any,edges:any,direction:string='TB') => {
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({ rankdir: direction });
 
	nodes.forEach((node:any) => {
		dagreGraph.setNode(node.id, { width: NodeWidth-40, height: NodeHeight });
	});
 
	edges.forEach((edge:any) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});
 
	dagre.layout(dagreGraph);
 
	const newNodes = nodes.map((node:any) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const newNode = {
			...node,
			targetPosition: isHorizontal ? 'left' : 'top',
			sourcePosition: isHorizontal ? 'right' : 'bottom',
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			position: {
				x: nodeWithPosition.x - NodeWidth / 2,
				y: nodeWithPosition.y - 80,
			},
		};
		// console.log('n',newNode)
 
		return newNode;
	});
 
	return { nodes: newNodes, edges };
};

export const __recalc__graph=(datas:any)=>{
	const newEdges = __recal__edges(datas as any);
	const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
		datas,
		newEdges,
		'TB',
	);
	const newNs=layoutedNodes.map((n:any)=>({
		id:n.id,
		type:'SpDef',
		position:n.position,
		data:{
			forward:n.forward,
			backward:n.backward,
			id:n.id,
			tp:n.tp,
		}
	}))
	return [newNs,layoutedEdges]
}
