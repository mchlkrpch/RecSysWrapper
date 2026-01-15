// @ts-expect-error: for jsx elements
import React, {
	useRef,
	useState
} from 'react';
import {
	SpEditorCtx,
	useGraphCtx,
	type DataTp
} from '../../context';
import {
	Box,
	Button,
	Clipboard,
	FileUpload,
	HStack,
	Icon,
	IconButton,
	Menu,
	Portal,
	Spacer,
	Spinner,
	Strong,
	Tabs,
	Text,
	Textarea,
	VStack
} from '@chakra-ui/react';
import {
	LuBookmark,
	LuBraces,
	LuChevronDown,
	LuChevronLeft,
	LuFileDown,
	LuFileJson,
	LuFilePlus,
	LuFolderPlus,
	// LuSave,
	LuTrash,
	LuUpload,
} from 'react-icons/lu';
import SpInput from '../../../SpInput/SpInput';
import {
	RxCounterClockwiseClock,
	RxFrame,
} from 'react-icons/rx';
import Feed from '../feed/feed';
import {
	__create_graph,
	__delete_graph,
	// __render_edit,
	__save_brief,
	__save_config,
	__save_nodes
} from '../../utils';
import { SpContent } from '../../../SpInput/body';

// const updateCardField=(editor:any,ref:any,cardI:number,side:string,blockI:number)=>{
const updateCardField=(editor:any,ref:any,inputerRef:any,cardI:number,side:string,blockI:number)=>{
	// const newCards = editor.current.getCards() as any;
	// if (editor.current.getRefs()&&editor.current.getRefs()[cardI][side][blockI].current) {
	// 	const t = ref?.current.getSpText()
	// 	if (t===''){
	// 		newCards[cardI][side] = newCards[cardI][side].filter((_cnt:string,i:number)=>i!==blockI);
	// 	}else{
	// 		newCards[cardI][side][blockI] = t;
	// 	}
	// }
	// editor.current.show(newCards)
	const newCards = editor.current.getCards() as any;
	if (editor.current.getRefs()&&inputerRef.current) {
		const t = ref?.current.getSpText()
		console.log('t:',t)
		console.log('ps:',text2CM(t))
		if (t===''){
			newCards[cardI][side] = newCards[cardI][side].filter((_cnt:string,i:number)=>i!==blockI);
		}else{
			const newCard=text2CM(t)
			// newCards[cardI][side][blockI] = t;
			newCards[cardI]=newCard
		}
	}
	editor.current.show(newCards)
}

const CardEditor=({card, card_i}: any)=>{
	const graphCtx = useGraphCtx() as any;
	const {
		editor,
	}=graphCtx;

	const [currentCard,setCurrentCard]=useState(card);
	const [isEdit,setIsEdit]=useState(false);
	const [currentBlock,setCurrentBlock]=useState(undefined) as any;
	// useEffect(()=>{
	// 	setCurrentCard(card);
	// },[card])
	const filedRef = useRef(null) as any;
	const editFieldRef=useRef(null) as any;
	const isBackwardMultiple = currentCard.backward.length > 1;

	if (!editor || !editor.current) {
		return <></>;
	}

	if (isEdit){
		return (
			<SpInput.Root
				ref={filedRef}
				json={card}
				defaultValue={''}
				input_ref={editFieldRef}
				initDisplay={false}
				onBlur={
					()=>{
						updateCardField(editor,filedRef,editFieldRef,card_i,'backward',currentBlock)
						setCurrentBlock(undefined);
						setIsEdit(false);
					}
				}
				>
				<SpInput.Body/>
			</SpInput.Root>
		)
	}

	return (
		<span className="fullW">
			<SpEditorCtx.Provider value={graphCtx}>
				<div className="fullW">
					{
					card.forward.map((content: string, c_i: number)=> {
						return (
							<span key={content + `${c_i}`+'strong'}>
								{c_i===0&&(
									<Strong
										opacity={'100%'} style={{zIndex: 3000}}>
										<Menu.Root
											defaultHighlightedValue={currentCard.tp}
											onSelect={(e:any)=>{
												const newCard=JSON.parse(JSON.stringify(currentCard))
												newCard.tp=e.value
												setCurrentCard(newCard);
												const newCards = editor.current.getCards() as DataTp[];
												newCards[card_i].tp = e.value;
												editor.current.show(newCards)
											}}
											>
											<Menu.Trigger asChild>
												<Button
													variant="plain" size="sm"
													className="cardTpButton"
													gap={'2px'}
													>
													{currentCard.tp}
													<LuChevronDown/>
												</Button>
											</Menu.Trigger>
											<Portal>
												<Menu.Positioner
													style={{
														zIndex: 3000,
													}}
													>
													<Menu.Content>
														<Menu.Item value="Th">Th</Menu.Item>
														<Menu.Item value="Def">Def</Menu.Item>
														<Menu.Item value="Task">Task</Menu.Item>
													</Menu.Content>
												</Menu.Positioner>
											</Portal>
										</Menu.Root>
									</Strong>
								)}
								<Box
									onClick={()=>{
										setCurrentBlock(c_i)
										setIsEdit(true);
									}}
									>
									<SpInput.Root
										ref={filedRef}
										defaultValue={content}
										json={card}
										input_ref={editor.current&&editor.current.getRefs()[card_i]['forward'][c_i]}
										// onBlur={
										// 	()=>updateCardField(
										// 		editor,filedRef,card_i,'forward',c_i
										// 	)}
										>
										<SpInput.Body/>
									</SpInput.Root>
								</Box>
							</span>
						)
					})
					}
					<Text
						className={'cnt-adder-card-editor'}
						onClick={()=>editor.append('new cnt', card_i, 'forward', editor.state.cards[card_i].forward.length)}
						>
						add content to forward
					</Text>
				</div>

				<span>
					{!isBackwardMultiple?(
						card.backward.map((content: any, c_i: number)=> {
							return (
								<Box
									key={content}
									onClick={()=>{
										setCurrentBlock(c_i)
										setIsEdit(true);
									}}
									>
									<SpInput.Root
										ref={filedRef}
										defaultValue={content}
										json={card}
										input_ref={editor.current&&editor.current.getRefs()[card_i]['backward'][c_i]}
										// onBlur={()=>updateCardField(
										// 	editor,filedRef,card_i,'backward',c_i
										// )}
										>
										<SpInput.Body/>
									</SpInput.Root>
								</Box>
							)
						})
					):(
						card.backward.map((content: any, c_i: number)=> {
							return (
								<HStack
									key={'b'+`${c_i}`}
									>
									<Text fontSize={'10px'}opacity={.3}>{c_i+1}.</Text>
									<Box
										onClick={()=>{
											setCurrentBlock(c_i)
											setIsEdit(true);
										}}
										>
										<SpInput.Root
											ref={filedRef}
											json={card}
											defaultValue={content}
											input_ref={editor.current&&editor.current.getRefs()[card_i]['backward'][c_i]}
											// onBlur={
											// 	()=>updateCardField(editor,filedRef,card_i,'backward',c_i)
											// }
											>
											<SpInput.Body/>
										</SpInput.Root>
									</Box>
								</HStack>
							)
						})
					)
					}
					<Text
						className={'cnt-adder-card-editor'}
						onClick={()=>editor.append('new cnt', card_i, 'backward', editor.state.cards[card_i].backward.length)}
					>
						add content to backward
					</Text>
				</span>
				<div style={{minHeight: '30px'}}/>
			</SpEditorCtx.Provider>
		</span>
	)
}


/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { NEW_JSON_CARD } from './root';
import { Tooltip } from '../../../ui/tooltip';
import { isGraphEditable } from '../../../../components/searcher/utils';
import { text2CM } from '../../../../utils/utils';
// import MarkdownPDFGenerator from './pdfExport';

const editorBodyStyle=css`
	position: relative;
	height: 100%;
	width:  100%;
	padding: 0;
	margin:  0;
	background-color: transparent;

	.editor-section-header {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 10;

		scrollbar-width: none;
		align-items: end;
		justify-content: center;
		padding: 0px;
		// margin-bottom:10px;
		// background-color:yellow;
		// background: -moz-linear-gradient(top, rgba(255,255,255,1) 100%, rgba(255,255,255,0) 0%);
		background: linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);
	}

	[data-part=trigger]{
		margin-bottom:10px;
		color: #444;
		padding: 10px;
		min-width: 45px;
		min-height: 45px;
		height:45px;
		font-size: 12px;
		border-radius: 25px;
		border: 1px solid #ddd;
		align-items: center;
		justify-content: center;
		background-color: var(--chakra-colors-chakra-body-bg, white);
	}
	[data-part=trigger]:hover{
		margin-bottom: 15px;
		transform: translateY(-2px);
		transition: all 0.03s ease-in-out;
	}
	[data-part=trigger][aria-selected=true]{
		color: white;
		border: none;
		background-color: #222;
		margin-bottom: 20px;
	}

	[data-part=content]{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;

		width:  100%;
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		scrollbar-width: none;
		padding: 0px;
		background-color: transparent;
	}

	.icon{
		min-width: 20px;
		width: 20px;
		min-height: 20px;
		height: 20px;
	}

	.button{
		cursor: pointer;
		color: blue;
		font-size: 14px;
		border: 1px solid transparent;
	}
	.button:hover{
		text-decoration: underline;
		border: 1px solid #ddeeff;
	}

	.textarea{
		outline: 0;
		border: 0;
		font-family: Roboto Mono;
		flex:1;
		scrollbar-width: none;
	}
`;

const EditorBody =(props:any)=>{
	const {
		id,ns,setNs,
		g,setG,
		editor,
		views,setViews,
		viewId,
		saveNs,setSaveNs,
		saveG,setSaveG,
		isMobile,
		editViewMode,setEditViewMode,
		nodesToSave,
		feedRef,
	}=useGraphCtx() as any;

	const{
		cards,currentViewId,setCurrentViewId,
	}=props as any;
	// console.log('views:', views)

	const textareaRef = useRef(null) as any;
	const [loading,setLoading]=useState(false) as any;
	const [errorTxt,setErrorTxt]=useState('')as any;

	const addCard=async()=>{
		const newCs = [...(editor.current.getCards()||[]),NEW_JSON_CARD]
		await editor.current.show(newCs)
	}
	const selectGroup=async(v:any)=>{
		const f=async()=>{
			await setSaveG(JSON.parse(JSON.stringify(g)));
			if(saveNs.length===0){
				await setSaveNs(JSON.parse(JSON.stringify(ns)));
			}
		}
		await f();

		if (g.parentId===null) {
			g.parentId=[]
		}
		if (g.parentId.length===0){
			g.parentId.push([g.name,viewId]);
		}
		setCurrentViewId(v.$id);
		g.name=v.name;
		g.description=v.description;
		// console.log('g',g)
		await setG(g);
		const s = new Set(g.views[v.$id]);
		if (saveNs.length!==0){
			setNs(saveNs.filter((n:any)=>s.has(n.id)));
		}else{
			setNs(ns.filter((n:any)=>s.has(n.id)));
		}
	}

	const isEditable = isGraphEditable();

	const selectParentGroup=async()=>{
		if (saveG&&saveG.parentId&&saveG.parentId.length>0){
			saveG.parentId=null;
		}
		await setG(saveG);
		const newNodes=[
			...saveNs.filter((n:any)=>!ns.includes(n.id)),
			...ns,
		]
		await setNs(newNodes);
		setCurrentViewId('');
	}

	let headerSections =[{
			title:'content',
			description:'edit node\'s content',
			triggerIcon: <LuBraces className='icon'/>,
		},{
			title:'views',
			description:'groupig nodes, creating subgraphs',
			triggerIcon: <LuBookmark className='icon'/>,
		},{
			title: "drop",
			description: 'drop the file with json',
			triggerIcon: <LuFileDown className='icon'/>
		},{
			title:'type',
			description:'type the json text or copy from AI',
			triggerIcon: <LuFileJson className='icon'/>,
		},{
			title:'repeat',
			description:'launch repeat process',
			triggerIcon: <RxCounterClockwiseClock className='icon'/>,
		}
	];
	if (isMobile||!isEditable){
		headerSections =[{
			title:'views',
			description:'groupig nodes, creating subgraphs',
			triggerIcon: <LuBookmark className='icon'/>,
		},{
			title:'repeat',
			description:'launch repeat process',
			triggerIcon: <RxCounterClockwiseClock className='icon'/>,
		}
		];
	}

	return (
		<Tabs.Root
			defaultValue='views'
			variant='subtle'
			css={editorBodyStyle}
			onValueChange={(details:any)=>{
				if (details.value==='repeat'){
					setEditViewMode(details.value)
				}else if(editViewMode==='repeat' && details.value!=='repeat'){
					setEditViewMode(details.value)
				}
			}}
			>
			{/* Edit cards */}
			<Tabs.Content value='content' p={0} bottom={'70px'}>
				<HStack w={'100%'}>
					<Clipboard.Root
						value={(editor===undefined||editor.current===null)?'':JSON.stringify(editor.current.getCards(),null,'\t')}>
						<Tooltip content='copy nodes json'>
							<Clipboard.Trigger asChild>
								<IconButton className='trigger-button'>
									<Clipboard.Indicator/>
								</IconButton>
							</Clipboard.Trigger>
						</Tooltip>
					</Clipboard.Root>
					<Spacer/>
					<Tooltip content='add new node to the graph'>
						{/* depends on permissions */}
						<button className='trigger-button' onClick={addCard}>
							<Icon as={LuFilePlus} boxSize="15px" />
						</button>
					</Tooltip>
				</HStack>

				<VStack
					overflowY={'auto'}
					w={'100%'}
					mb={'50px'}
					>

					{cards.map((card: any, card_i: number)=>
						<CardEditor
							key={card.id+card.tp+`f|${card.forward.length}b|${card.backward.length}`}
							card={card}
							card_i={card_i}
						/>)}
				</VStack>
			</Tabs.Content>

			{/* grouping items */}
			<Tabs.Content value="views">
				<VStack
					alignItems={'start'}
					align={'stretch'}
					w={'100%'}
					overflowY={'auto'}
					mb={'50px'}
					>
					<HStack w={'100%'}>
						{g&&g.parentId&&(
							<button className='button' data-part='trigger'
								onClick={async()=>{
									await selectParentGroup()
								}}
								>
								<Icon as={LuChevronLeft} boxSize="15px" />
							</button>	
						)}
						<Spacer/>
						{isEditable&&(
							<button className='trigger-button'
								onClick={async()=>{
									const newViews = await __create_graph(id,views) as any;
									await setViews([...newViews])
								}}
								>
								<Icon as={LuFolderPlus} boxSize="15px" />
							</button>
						)}
					</HStack>

					<VStack gap={0} w={'100%'}>
						{views&&views.map((v:any,i:number)=>{
							console.log('views:',views)
							const customStyle={}as any;
							if (currentViewId===v.$id){
								customStyle.border='1px solid blue';
							}
							return(
								<HStack alignItems={'center'} key={i} w={'100%'}>
									<Button
										variant='ghost'
										p={'10px'}
										flex={1}
										justifyContent={'flex-start'}
										onClick={()=>selectGroup(v)}
										h={'fit-content'}
										style={customStyle}
										>
										<Icon as={RxFrame} boxSize="15px" />
										<VStack alignItems={'flex-start'} gap={0}>
											<Strong p={0} fontSize={'13px'}>
												{v.name}
											</Strong>
											<Box
												opacity={.6}
												w={'100%'}
												alignItems={'flex-start'}
												fontWeight={400}
												textWrap={'wrap'}
												textAlign={'left'}
											>
												<SpContent
													content={v.description}
												/>
											</Box>
										</VStack>
									</Button>
									{!isMobile&&isEditable&&
									<button className='button' data-part='trigger'
										onClick={async()=>{
											__delete_graph(v.$id)
											const newViews = views.filter((vId:any)=>v.$id!==vId.$id)
											await setViews([...newViews])
										}}
									>
										<LuTrash className='icon'/>
									</button>
									}
								</HStack>
							)
						})}
					</VStack>
				</VStack>
			</Tabs.Content>

			{/* import entire file */}
			<Tabs.Content value="drop">
				<FileUpload.Root
					maxW="xl"
					alignItems="stretch"
					maxFiles={10}
					border={0}
					h={'100%'}
					>
					<FileUpload.HiddenInput/>
					<FileUpload.Dropzone
						border={0}
						h={'100%'}
						>
						<VStack>
							<Icon size="md" color="fg.muted">
								<LuUpload />
							</Icon>
							<FileUpload.DropzoneContent h={'100%'}>
								<Box>Drag and drop files here</Box>
								<Box color="fg.muted">.txt, .json up to 5MB</Box>
							</FileUpload.DropzoneContent>
						</VStack>
					</FileUpload.Dropzone>
					<FileUpload.List />
				</FileUpload.Root>
				<HStack
					mt={'20px'}
					w={'100%'} mb={'100px'}
					justifyContent={'center'}
					p={0}
					display={'flex'}
					align={'stretch'}
					>
					<Button
						flexGrow={1}
						rounded={'full'}
						onClick={()=>{
							g['nodes']=ns;
							console.log('g:',g)
							const jsonString = JSON.stringify(g, null, 2);
							const encodedJson = encodeURIComponent(jsonString);
							const dataUri = 'data:application/json;charset=utf-8,' + encodedJson;
							const link = document.createElement('a');
							link.setAttribute('href', dataUri);
							link.setAttribute('download', `${g.name}.json`);
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						}}
					>
						load json
					</Button>
					{/* <MarkdownPDFGenerator
						graph={g}
						ns={ns}
						fileName="my-report.pdf" 
					/> */}
				</HStack>
			</Tabs.Content>

			{/* copy */}
			<Tabs.Content value="type">
				<Textarea
					className='textarea'
					ref={textareaRef}
					placeholder={'Type or copy from AI'}
				/>

				{errorTxt.length!==0&&
				<Button
					variant={'surface'}
					fontSize={'12px'}
					colorPalette={'red'}
					textWrap={'wrap'}
					colorScheme={'red'}
					w={'100%'}
					h={'fit-content'}
					textAlign={'start'}
					>
					{errorTxt}
				</Button>}

				<button
					className='button'
					data-part='trigger'
					style={{
						zIndex:4000,
						marginBottom:'40px',
					}}
					onClick={()=>{
						if (textareaRef.current) {
							try{
								const cs = JSON.parse(textareaRef.current.value)
								editor.current.show(cs)
								textareaRef.current.value=''
							}catch(error){
								console.error(error)
								setErrorTxt(`error parsing json: ${error}`);
							}
						}
					}}>
					Add cards
				</button>
			</Tabs.Content>

			{/* Repeat content */}
			<Tabs.Content value='repeat'>
				<Feed ref={feedRef}/> 
			</Tabs.Content>

			{/* choose editor section here*/}
			<HStack className='editor-section-header'>
				{headerSections.map((s:any)=>(
					<Tooltip content={s.description} key={s.title}>
						<Tabs.Trigger value={s.title}>
							{s.triggerIcon}
						</Tabs.Trigger>
					</Tooltip>
				))}
				{(!isMobile&&isEditable)&&
				<Button
					p={0}
					variant={'plain'}
					value="save"
					h={'40px'}
					backgroundColor={'#eee'}
					mb={'10px'}
					onClick={async()=>{
						setLoading(true);
						console.log('viewId',viewId)
						console.log('currentViewId',currentViewId)
						if (
							g.parentId !== null&&g.parentId.length !== 0
						){
							// save current module
							// console.log('g',g)
							await __save_brief(currentViewId,g.name, g.description);
							// switch to the parent
							// await selectParentGroup()

							// save nodes for module
							// console.log('save', ns, 'for', currentViewId)
							await __save_config(ns,currentViewId);
							await __save_nodes(ns);
							const newNodes=[
								...saveNs.filter((n:any)=>!ns.includes(n.id)),
								...ns,
							]
							// await setNs(newNodes);
							// save nodes for parent
							// console.log('save', newNodes, 'for', viewId)
							await __save_config(newNodes,viewId);
							// console.log('g',g)
						} else {

							await __save_brief(viewId,g.name, g.description);
							await __save_config(ns,viewId);
							const nsToSave=ns.filter((n:any)=>nodesToSave.has(n.id))
							await __save_nodes(nsToSave);
						}
						setLoading(false);
					}}
					>
					{loading===true&&(
						<Spinner/>
					)}
					{loading===false&&(

						<>save</>
					)}
				</Button>
				}
			</HStack>
		</Tabs.Root>
	)
}

export default EditorBody;