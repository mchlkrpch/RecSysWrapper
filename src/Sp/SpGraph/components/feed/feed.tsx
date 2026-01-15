import React, { useState, useMemo, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { 
	Box,
	Text,
	VStack,
	// Separator,
	Spacer,
	HStack,
	// Image,
	// Input,
	Strong,
	chakra,
	Image,
	Separator,
	Input,
	Spinner,
} from "@chakra-ui/react";
import {useGraphCtx, type DataTp, type SpId, type UpdateProgressTp} from "../../context";
import {getAgo, SpRanker } from "./SpRanker";
import { SpContent } from "../../../SpInput/body";
import SpInput from "../../../SpInput/SpInput";


import {
	motion,
	useMotionValue,
	useAnimation,
	useTransform,
	// PanInfo,
} from "framer-motion";

// Создаем motion-совместимый Box от Chakra UI
const MotionBox = chakra(motion.div);

const CardItem: React.FC<any> = (data:any) => {
	const {
		card,
		ago,
		cardIndex,
		initIsFlipped,
	} = data

	// step-wise reveal state
	const [variantIndex, setVariantIndex] = useState(0);
	const [ans,setAns]=useState('');

	// Normalize content to support single or multiple variants
	const forwardVariants: any[] = useMemo(()=>{
		// if (card&&card.forward && card.forward.length > 0 && Array.isArray(card.forward[0])) {
		// 	return card.forward as unknown as string[][];
		// }
		if (card&&card.forward && card.forward.length > 0) {
			if (Array.isArray(card.forward[0])){
				return card.forward as string[][];
			}else{
				return [card as string[]];
			}
		}
		return [[]];
	}, [card]);
	const backwardVariants: any[] = useMemo(()=>{
		// if (card!==undefined&&card.backward!==undefined && card.backward.length > 0 && Array.isArray(card.backward[0])) {
		// 	return card.backward as unknown as string[][];
		// }
		// return [card.backward as unknown as string[]];
		if (card&&card.backward && card.backward.length > 0) {
			if (Array.isArray(card.backward[0])){
				return card.backward as string[][];
			}else{
				return [card as string[]];
			}
		}
		return [[]];
	}, [card]);
	const variantsCount = Math.min(forwardVariants.length, backwardVariants.length) as any;
	const curForward = forwardVariants[Math.min(variantIndex, variantsCount-1)].forward || [];
	const curBackward = backwardVariants[Math.min(variantIndex, variantsCount-1)].backward || [];
	const [isFlipped, setIsFlipped] = useState(initIsFlipped);
	const [stepIndex, setStepIndex] = useState(initIsFlipped?curBackward.length:0);
	
	const [, setSwipedRight] = useState(false);
	const [, setSwipedLeft] = useState(false);
	const x = useMotionValue(0);
	const controls = useAnimation();
	// const rightActionOpacity = useTransform(x, [0, 50], [0, 1]);
	// const leftActionOpacity = useTransform(x, [0, -50], [0, 1]);
	const leftNumberOpacity = useTransform(x, [25, 50], [0, 1]);
	const rightNumberOpacity= useTransform(x, [-25, -50], [0, 1]);
	const xPixels = useTransform(x, value => (value > 0 ? Math.round(value) : 0));

	const [forget,]=useState(false);
	const [hover,]=useState(false);

	const {
		ns,feedRef,
	} = useGraphCtx() as any;

	if (!card){
		return (<></>)
	}

	const responces = [
		[
			'https://cdn.sstatic.net/Sites/math/Img/apple-touch-icon@2.png?v=4ec1df2e49b1',
			'',
			'site:math.stackexchange.com',
		],[
			'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png',
			'',
			'site:wikipedia.com',
		],
	]

	let isBackwardMultiple =false
	let inputClassname = ''
	let tpTitle = '' as string;

	
	if(card!==undefined&&card.backward!==undefined){
		isBackwardMultiple=card.backward.length > 1;
		let bwdReplace=data.card.backward[0]
		const replacementMap = new Map();
		const matches = bwdReplace.matchAll(/<id=([^>]+)>/g);
		for (const match of matches) {
			const idContent = match[1];
			const [n] = ns.filter((n:any)=>n.id===idContent) as any;
			if (n&&n.data.forward[0]){
				replacementMap.set(`<id=${idContent}>`, n.data.forward[0]);
			}
		}
		replacementMap.forEach((replacement, pattern) => {
			bwdReplace = bwdReplace.replace(new RegExp(pattern, 'g'), replacement);
		});
		
		if (ans.toLowerCase()===bwdReplace.toLowerCase()) {
			inputClassname='feed-block-Task-input-answer-correct'
		}else{
			inputClassname='feed-block-Task-input-answer'
		}
		
		if (card) {
			if (card.tp == 'Task') {
				tpTitle=`${cardIndex+1}.`
			}else{
				tpTitle=card.tp
			}
		}
	}

	const tpColor=(tp:string)=>{
		if (tp==='Th'){
			return '#6ED082'
		}
		if (tp==='Def'){
			return '#86A8FF';
		}
		return 'black'
	}

	const swipeThreshold = 200;
	const swipeToStickPosition = 70;

	const handleCardClick=(event: any)=>{
		// @ts-expect-error: only value is needed, todo: fix
		if (Math.abs(xPixels.current) > 70) {
			return;
		}
		if (!isFlipped) {
			setIsFlipped(true);
			setStepIndex(1);
			return;
		}

		if (event.ctrlKey || event.metaKey) {
			event.preventDefault(); // Предотвращаем стандартное поведение (например, открытие ссылки)
			event.stopPropagation(); // Останавливаем всплытие события, чтобы не сработали другие клики
			
			console.log('select card for llm:', card)
			// const currentSelected=feedRef.current.getSelectedCards()
			feedRef.current.selectCards([
				// ...currentSelected,
				[{idx:cardIndex,card:card}],
			])
			console.log('currentSelected',feedRef.current.getSelectedCards())
			return;
		}
		
		// if flipped: reveal next step or cycle
		if (stepIndex < curBackward.length) {
			setStepIndex(stepIndex + 1);
		} else {
			// finished this variant; if multiple variants, go to the next, else flip back
			if (variantsCount > 1) {
				const nextVariant = (variantIndex + 1) % variantsCount;
				setVariantIndex(nextVariant);
				setStepIndex(0);
				setIsFlipped(false);
			} else {
				setStepIndex(0);
				setIsFlipped(false);
			}
		}
	};


	const handleDragEnd=(
		e: MouseEvent|TouchEvent|PointerEvent,
		info: any,
	) => {
		const offset = info.offset.x;
		const velocity = info.velocity.x;
		e.stopPropagation()
			e.preventDefault()

		if (offset > swipeThreshold || velocity > 500) {
			setSwipedRight(true);
			controls.start({
				x: swipeToStickPosition,
				transition: { type: "spring", stiffness: 200, damping: 25 },
			});
			e.stopPropagation()
			e.preventDefault()
		} else if (offset < -swipeThreshold || velocity < -500) {
			controls.start({
				x: -swipeToStickPosition,
				transition: { type: "spring", stiffness: 300, damping: 30 },
			});
			e.stopPropagation()
			e.preventDefault()
			console.log('SELECT CARD:',card)
			setSwipedLeft(true);
			feedRef.current.selectCards(
				[
					...feedRef.current.getSelectedCards(),
					{idx:cardIndex,card:card},
				],
			)
		} else {
			e.stopPropagation()
			e.preventDefault()
			setSwipedRight(false);
			setSwipedLeft(false);
			// feedRef.current.selectCards(undefined)
			feedRef.current.selectCards(
				feedRef.current.getSelectedCards().filter((n:any)=>n.idx!==cardIndex),
			)
			controls.start({
				x: 0,
				transition: { type: "spring", stiffness: 300, damping: 30 },
			});
		}
	};
    
	// const undoSwipe = (e:any) => {
	// 	setSwipedRight(false);
	// 	setSwipedLeft(false);
	// 	e.stopPropagation()
	// 	e.preventDefault()
	// 	controls.start({
	// 		x: 0,
	// 		transition: { type: "spring", stiffness: 300, damping: 30 },
	// 	});
	// };

	return (
		<Box
			className={'block-frame'}
			h={'fit-content'}
			minH={'80px'}
			position={'relative'}
			w="100%" overflow="hidden" userSelect="none"
			backgroundColor={'transparent'}
			flexShrink={0}
			fontFamily={'Roboto'}
			>
			<HStack
				position="absolute"
				top={0}
				left={0}
				right={0}
				bottom={0}
				px={4}
				alignItems="center"
				justifyContent="space-between"
				pointerEvents="none"
				backgroundColor={'transparent'}
			>
				<MotionBox
						// Применяем нашу новую прозрачность
						style={{ opacity: leftNumberOpacity }}
						// Стили для красивого отображения числа
						display="flex"
						alignItems="center"
						color="gray.400"
						fontWeight="bold"
						fontSize="lg"
				>
						{/* <motion.span>{xPixels}</motion.span> */}
						{/* <Icon as={LuEyeClosed} color="green.400" boxSize={5} /> */}
				</MotionBox>
				<Spacer />
			</HStack>
			<MotionBox 
				backgroundColor={'transparent'}
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				onDragEnd={(e,info)=>handleDragEnd(e,info,)}
				style={{
					x:x,
					backgroundColor:'transparent',
					minHeight: '40px',
				}}
				animate={controls}
				// @ts-expect-error type correct
				transition={{ type: "spring", stiffness: 400, damping: 40 }}
				w="100%"
				// bg="white"
				zIndex={1}
				flexDirection={'column'}
			>
				<HStack gap={0}>
					<Box
						className={`forget-${forget}-${hover}`}
						cursor="pointer"
						minH={'40px'}
						flex="1"
						onClick={handleCardClick}
						h={'fit-content'}
						// boxShadow={'0px 0px 20px 10px rgba(0,0,0,0.05)'}
						>
						<Box className='feed-block' h={'100%'}>
							<HStack align='stretch' h={'100%'} fontFamily={'Roboto'}
								ml={'-60px'}
								mr={'-90px'}
								>
								<MotionBox
									// Применяем нашу новую прозрачность
									style={{ opacity: leftNumberOpacity }}
									// Стили для красивого отображения числа
									display="flex"
									// alignItems="center"
									fontSize="lg"
								>
									<Box
										gap={'5px'}
										padding={'5px'}
										borderRadius={'8px'}
										h={'25px'}
										// boxShadow={'0px -10px 15px 4px rgba(0,0,0,0.08)'}
										color="white"
										backgroundColor={'blue.400'}
										className='inter-medium'
										fontSize={'12px'}
										>
										забыто
									</Box>
								</MotionBox>
								<VStack align="stretch" flex={1} className={'inter-light'}>
									<HStack gap={'2px'} fontSize={'16px'}>
										<Strong
											style={{
												fontSize:'12px',
												padding: '2px',
												color: tpColor(tpTitle),
												border:card.tp==='Task'?`1px solid #999`:'',
												gap: '0px',
											}}
											>
											{tpTitle}
										</Strong>

										<SpContent content={curForward.join('\n')||''} isInner={true}/>
										<Spacer/>
										{isBackwardMultiple?(
											<>
												<Text fontSize={'10px'}opacity={.3}>({card.backward.length})</Text>
											</>
										):(<>
										</>)}
									</HStack>

									{card.tp=='Task'&&(
										<HStack>
											<Input
												onClick={(e:any)=>{
													e.preventDefault()
													e.stopPropagation();
												}}
												className={inputClassname}
												defaultValue={ans}
												onChange={(e:any)=>{
													setAns(e.target.value)
												}}
											/>
										</HStack>
									)}

									{isFlipped && (
									<div className='card-repeat-backward'
										style={{
											fontSize:'13px',
										}}
										>
										{isBackwardMultiple?(
											curBackward.slice(0, Math.max(0,stepIndex)).map((content:string,blockId:number)=>{
												return(
													<HStack key={'b'+blockId} gap={'2px'}>
														<Text fontSize={'10px'}opacity={.3}>{blockId+1}.</Text>
														<SpContent
															key={`${content}+${blockId}`}
															content={content}
															isInner={true}
														/>
													</HStack>
												)
											})):(
												curBackward.slice(0, Math.max(0,stepIndex)).map((content:string,blockId:number)=>{
													return(
														<SpInput.Root
															key={`${content}+${blockId}`}	
															defaultValue={content}
															>
															<SpInput.Body/>
														</SpInput.Root>
														// <SpInputContext.Provider
														// 	key={`${content}+${blockId}`}
														// 	value={inputCtx}>
														// </SpInputContext.Provider>
													)
												})
											)
										}
										<div className="feed-block-links">
											{responces.map(([avaUrl,text,ops]:any,idx:number)=>{
												let words=text.split(' ')
												words = [...words, ...curForward.join(' ').split(' ')]
												return (
													<a
														key={idx}
														href={`https://www.google.com/search?q=${words.join('+')+' '+ops}`}
														onClick={(e:any)=>{
															e.stopPropagation()
														}}
														>
														<HStack gap="7px" p={0}>
															<Image
																src={avaUrl}
																rounded={'full'}
																p={'5px'}
																style={{
																	width:'25px',
																	height: '25px',
																}}
																/>
															<Separator
																orientation="vertical" height="35px"
																/>
															<Text>{words.join(' ')}</Text>
														</HStack>
													</a>
												)})
											}
										</div>
									</div>
									)}
									<div className='feed-frame-ago'>
										{ago}
									</div>

									{/* Variant indicator if multiple variants */}
									{variantsCount > 1 && (
										<Text fontSize={'10px'} opacity={'50%'}>
											вариант {variantIndex+1} из {variantsCount}
										</Text>
									)}
								</VStack>
								<MotionBox
									// Применяем нашу новую прозрачность
									style={{ opacity: rightNumberOpacity }}
									// Стили для красивого отображения числа
									display="flex"
									// alignItems="center"
									fontSize="lg"
								>
									<Box
										gap={'5px'}
										padding={'5px'}
										borderRadius={'8px'}
										h={'25px'}
										// boxShadow={'0px -10px 15px 4px rgba(0,0,0,0.08)'}
										color="white"
										backgroundColor={'blue.400'}
										className='inter-medium'
										fontSize={'12px'}
										>
										в контексте
									</Box>
								</MotionBox>
							</HStack>
						</Box>
					</Box>
				</HStack>
			</MotionBox>
			{/* {swipedLeft && (
				<Box
					position="absolute"
					top="50%"
					right="5px"
					transform="translateY(-50%)"
					onClick={undoSwipe}
					cursor="pointer"
          zIndex={0}
				>
					<Text
						color="gray.300"
						fontSize={'12px'}
						>
						в контексте
					</Text>
				</Box>
			)} */}
		</Box>
	  );
};

type ObserverOptions = IntersectionObserverInit;
type ObserverCallback = ()=>void;
type TargetRef = any;

export const ROLE_ME=0;
export const ROLE_MODEL=1;

const Dialogue=(props:any)=>{
	const{
		content
	}=props;
	return(
		<VStack w={'100%'} mt={'5px'}>
			{content.map((msg:any,i:number)=>{
				const{
					role,
					text,
					loading,
				}=msg as any;
				const style={} as any;
				style.fontSize='13px';
				if (role===ROLE_ME){
					style.marginRight='10px';
					style.color='white';
					style.backgroundColor='blue';
					style.alignSelf='end';
					style.borderRadius='10px';
					style.padding='5px';
				}else if (role===ROLE_MODEL){
					style.marginRight='20px';
					style.alignSelf='start';
					style.color='222';
					style.borderRadius='10px';
					style.padding='5px';
					style.backgroundColor='#eee';
				}
				return (
					<Box key={i+text} style={style}>
						{role===1&&(
							<Box fontSize='10px' opacity={0.3}>model</Box>
						)}
						{loading&&(
							<Spinner key={i} size='sm'/>
						)}
						<SpContent content={text}/>
						{/* {text} */}
					</Box>
				)
			})}
		</VStack>
	)
}

const useInfiniteScroll = (
	callback: ObserverCallback,
	ref: TargetRef,
	options?: ObserverOptions
) => {
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				callback();
			}
		}, options);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [callback, ref, options]);
};

const Summary=()=>{
	const {
		ns,
	}=useGraphCtx() as any;
	// console.log('ns',ns)

	const Title=(props:any)=>{
		const [isHide,setIsHide]=useState(true)as any;
		const {
			n,title,cs,
		}=props;
		if (n===0){
			return <></>
		}
		return (
			<VStack
				alignItems={'flex-start'}
				w={'100%'}
				p={'4px'}
				gap={0}
				backgroundColor={'white'}
				>
				<Box
					display={'flex'}
					flexDirection={'row'}
					justifyContent={'start'}
					alignItems={'center'}
					className='summary-block'
					onClick={()=>{
						setIsHide((v:any)=>!v);
					}}
				>
					<Box
						p={'3px'}
						backgroundColor={'#eee'}
						fontSize={'14px'}
						borderRadius={'6px'}
						fontWeight={600}
					>{n}</Box>{title}:
				</Box>
				{!isHide&&(
					<VStack
						w={'100%'}
						maxH={'250px'}
						gap={0}
						overflowY={'auto'}
						ml={'10px'} 
						alignItems={'start'}
						>{
						cs.map((n:any)=>{
							return(
								<>
									<HStack
										key={n.id}
										fontSize={'14px'}
										fontFamily={'Inter'}
										opacity={0.6}
										>
										<SpContent
											content={n.data.forward[0]}
										/>
									</HStack>
									<Separator w={'100%'}/>
								</>
							)
						})
					}</VStack>
				)}
			</VStack>
		)
	}

	const defs=ns.filter((n:any)=>n.data.tp==='Def')
	const ths=ns.filter((n:any)=>n.data.tp==='Th')
	const tasks=ns.filter((n:any)=>n.data.tp==='Task')

	return (
		<VStack
			gap={0}
			w={'100%'} h={'fit-content'}
			fontFamily={'Inter'}
			p={'10px'}
		>
			<Box
				borderRadius={'5px'}
				w={'100%'}
				border={'1px solid #2288dd'}
				backgroundColor={'white'}
				p={'6px'}
				>
				<Strong>
					Feed module summary
				</Strong>
				<Title
					n={defs.length} title={'fact-cards'}
					cs={defs}
				/>

				<Title
					n={ths.length} title={'logic'}
					cs={ths}
				/>

				<Title
					n={tasks.length} title={'tasks/examples'}
					cs={tasks}
				/>
			</Box>
		</VStack>
	)
}

const FeedFwd=(props:any, ref:any)=>{
	// ... вся ваша логика состояний до return остается без изменений ...
	const {
		ns,
		progress,
	} = useGraphCtx() as any;

	let cs: DataTp[] = [];
	if (ns) {
		cs = ns.map((n: any) => n.data)
	}
	const [localProgress, setLocalProgress] = useState(progress);
	const [blocksHistory, setBlocksHistory] = useState([] as string[]);
	const Ranker = new SpRanker(
		cs,
		localProgress, setLocalProgress,
		blocksHistory,
		{ b: 2, t: 1, k: 3 },
	)

	const [currentBatchIds, setCurrentBatchIds] = useState<SpId[][]>([]);
	const [flatIds,setFlatIds]=useState(currentBatchIds.flat()) as any;

	useEffect(()=>{
		setFlatIds(currentBatchIds.flat())
	},[currentBatchIds])
	const cardsMap = useMemo(() => new Map(cs.map((card: DataTp) => [card.id, card])), [cs]);
	const [dialogueCards,setDialogueCads]=useState({}) as any;

	const selectedCards = useRef<any>([]) as any;

	useImperativeHandle(ref,()=>({
		insertCard: (
			newId: SpId,
			position: number,
			content:any[]
		)=>{
			console.log(`Вызван insertCard: Вставить ID '${newId}' на позицию ${position}`);
			setCurrentBatchIds((prevBatches:any)=>{
					const flatIds = prevBatches.flat();
					flatIds.splice(position+1, 0, 'com_'+newId);
					setDialogueCads((l:any)=>{
						l[newId]=content
						return l;
					})
					return flatIds;
			});
		},
		selectCards:(cs:any)=>{
			selectedCards.current=cs;
		},
		getSelectedCards:()=>selectedCards.current,
		extendDialogue:(
			dialogueId:string,
			msgs:any,
		)=>{
			setDialogueCads((currentDialogueCards:any)=>{
				// console.log('l[dialogueId]',l[dialogueId])
				// l[dialogueId]=[...l[dialogueId],...msgs]
				// console.log('now:',l[dialogueId])
				// return l;
				return {
					...currentDialogueCards,
					[dialogueId]: [
						...(currentDialogueCards[dialogueId] || []),
						...msgs,
					]
        };
			})
		},
		getIds:()=>flatIds,
		sendLLMAnswer:(
			dialogueId:string,
			LLMresp:string,
		)=>{
			setDialogueCads((currentDialogueCards:any)=>{
				const oldDialogue = currentDialogueCards[dialogueId];
        const newDialogue = oldDialogue.map((message: any, index: number) => {
					if (index === oldDialogue.length - 1) {
						return {
							...message,
							text: LLMresp,
							loading: false
						};
					}
					return message;
        });
        return {
					...currentDialogueCards,
					[dialogueId]: newDialogue
        };
			})
		},
		getCurrentPos:()=>lastLoggedIndex.current,
		isDialogueVisible:()=>isTopObserverDialogue.current,
	}), [flatIds, dialogueCards,setDialogueCads]);

	const scrollContainerRef = useRef(null);
	const sentinelRef = useRef(null);
	const observerOptions = {
		root: scrollContainerRef.current,
		rootMargin: '0px 0px 200px 0px',
		threshold: 0,
	};
	useInfiniteScroll(() => {
		const b = Ranker.getNextBatch();
		if (!b || b.length === 0) return;
		setCurrentBatchIds(prev => [...prev, b]);
		const nextBatchTp = cardsMap.get(b[0])?.tp || '';
		setBlocksHistory(prev => [...prev, nextBatchTp]);
		const changes = b.map((id: SpId) => ({ id: id, result: true } as UpdateProgressTp));
		Ranker.updateProgress(changes);
	}, sentinelRef, observerOptions);

	const lastLoggedIndex = useRef<number | null>(null);
	const topObserver = useRef<IntersectionObserver | null>(null);
	const isTopObserverDialogue = useRef<boolean>(null) as any;
	
	// 1. Ref для хранения всех видимых в данный момент элементов
	const visibleElements = useRef(new Map<Element, DOMRectReadOnly>());
	const rafId = useRef<number>(0);
	const findAndLogTopmost = useCallback(() => {
		cancelAnimationFrame(rafId.current);
		rafId.current = requestAnimationFrame(() => {
			if (selectedCards.current.length>0){
				const arr=selectedCards.current
				console.log('arr:',arr)
				console.log('selectedCards.current',arr[arr.length-1].idx+2)
				lastLoggedIndex.current=arr[arr.length-1].idx+2;
				console.log('lastLoggedIndex.current now',lastLoggedIndex.current)
				return;
			}
			if (visibleElements.current.size === 0) {
				return;
			}
			// console.log('entries:',Array.from(visibleElements.current.entries()))
			let conv=undefined as any;
			let glId=undefined as any;
			Array.from(visibleElements.current.entries()).map((c:any) => {
				if (c[0].id.slice(0,4)==='com_'){
					conv=c[0].id.slice(4)
					glId=parseInt(c[0].dataset.globalIndex, 10);
				}
			});
			
			if (!conv){
				const topmost = Array.from(visibleElements.current.entries()).reduce((min, current) => {
					return current[1].top < min[1].top ? current : min;
				});
				const topmostElement = topmost[0];
				// @ts-expect-error dataset exsists
				const currentIndex = parseInt(topmostElement.dataset.globalIndex, 10);
				if (!isNaN(currentIndex) && lastLoggedIndex.current !== currentIndex) {
					console.log("Индекс верхней видимой карточки:", currentIndex);
					lastLoggedIndex.current = currentIndex;
					isTopObserverDialogue.current=false;
					// setCurIdx(currentIndex)
				}
			} else{
				// console.log('comv',conv)
				console.log('glId',glId)
				lastLoggedIndex.current = glId;
				isTopObserverDialogue.current=true;
			}
			// console.log('currentIndex',currentIndex)
			// console.log('lastLoggedIndex.current !== currentIndex',lastLoggedIndex.current)
		});
	}, []);


	useEffect(() => {
		const options = {
			root: scrollContainerRef.current,
			rootMargin: '0px',
			threshold: [0, 0.1, 0.9, 1], // Больше порогов для более точного срабатывания
		};

		const callback: IntersectionObserverCallback = (entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					// Если элемент стал видимым, добавляем/обновляем его в Map
					visibleElements.current.set(entry.target, entry.boundingClientRect);
				} else {
					// Если элемент перестал быть видимым, удаляем его
					visibleElements.current.delete(entry.target);
				}
			});

			// После каждого обновления запускаем поиск самого верхнего элемента
			findAndLogTopmost();
		};

		topObserver.current = new IntersectionObserver(callback, options);
		
		return () => {
			topObserver.current?.disconnect();
			cancelAnimationFrame(rafId.current);
		};

	}, [findAndLogTopmost]);

	const cardRefCallback = useCallback((node: HTMLDivElement | null) => {
		const observer = topObserver.current;
		if (observer) {
			if (node) {
				observer.observe(node);
			}
		}
	}, []);

	// const flatIds = useMemo(
	// 	()=>currentBatchIds.flat()
	// ,[currentBatchIds]);

	// console.log('flatIds',flatIds)

	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			h={'100%'}
		>
			<div
				className='feed-frame'
				style={{
					height: '750px',
					display: 'flex',
					flexDirection: 'column',
					paddingRight: '0px',
					overflowY: 'auto',
				}}
				ref={scrollContainerRef}
			>
				<Summary/>
				{flatIds.map((id: string, globalIndex: number) => {
					// const clsNm=globalIndex===lastLoggedIndex.current?'selected-block':'';
					if (id.slice(0,4)==='com_'){
						// const commentId=id.slice(4)
						// console.log('comId',commentId);
						// console.log('com:',dialogueCards[id.slice(4)])
						return(
							<div
								id={id}
								// className={clsNm}
								ref={cardRefCallback} 
								data-global-index={globalIndex}
								key={id + `-wrapper` + globalIndex}
							>
								<Dialogue
									content={dialogueCards[id.slice(4)]}
								/>
							</div>
						)
					}else{
						const cardData = cardsMap.get(id) as DataTp;
						if (!cardData || !localProgress[id]) return null;
	
						const history = localProgress[id].data.history;
						return (
							<div 
								// className={clsNm}
								ref={cardRefCallback}
								data-global-index={globalIndex}
								key={id + `-wrapper`+globalIndex}
							>
								<CardItem
									key={id}
									cardIndex={globalIndex}
									card={cardData}
									initIsFlipped={history.length === 2 && cardData.tp !== 'Task'}
									ago={getAgo(history.length > 0 ? Date.now() - history[history.length - 1] : Date.now())}
								/>
							</div>
						)
					}
				})}
				<div ref={sentinelRef} style={{ height: 1 }} />
			</div>
		</Box>
	);
}

const Feed = forwardRef<any,any>(FeedFwd)

export default Feed;