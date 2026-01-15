import React, { useEffect, useRef, useState } from "react";

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
	Box,
	Button,
	Field,
	For,
	HStack,
	// Icon,
	Input,
	Menu,
	NativeSelect,
	Portal,
	Separator,
	Spacer,
	Spinner,
	Tabs,
	VStack
} from "@chakra-ui/react";
import {
	LuChevronDown,
	LuClipboardPlus,
	LuFolder,
	LuUser,
	LuWaypoints
} from "react-icons/lu";
import UserCard from "../usercard";
import {
	createMyGraph,
	grantEditPermission,
	migrateData,
	NAMESPACE_COLLECTION_ID,
	NODES_COLLECTION_ID,
	revokeEditPermission,
	space_db_id
} from "../../utils/appwrite";
import { History } from "../../utils/history";
import store from "../../storage";
import SpGraph from "../../Sp/SpGraph/SpGraph";
import {
	user_collection_id
} from '../../utils/appwrite';
import { spaced_databases } from "../../utils/appwrite";
import { ID, Query } from "appwrite";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useGraphCtx } from "../../Sp/SpGraph/context";
import { SpEditorComponentCtx } from "../../Sp/SpGraph/components/editor/context";
import SpInput from "../../Sp/SpInput/SpInput";
import { LLMreq } from "./llm";
import { getSearchPlaceholer, isGraphEditable, WAIT_USER_ACTION_TIME } from "./utils";
import { SpContent } from "../../Sp/SpInput/body";
import SendSVG from '../../media/send-clock-svgrepo-com.svg?react';

// increase opacity when .child hovered
const searcherStyle = css`
	width: 100%;
	padding-left: 5px;
	padding-right: 5px;

	display:flex;
	height:100%;

	[data-part="content"] {
		display: flex;
		flex-direction: column;
		
		width:100%;
		min-height: 0;
		height: 100%;
		max-height: 100%;
		overflow-y: hidden !important;
	}

	[aria-selected="true"]{
		background-color: white;
		// border: 1px solid #21808d;
		border-bottom: 4px solid #0048ff;
		color: #0048ff;

		display:flex;
		align-items:center;
		justify-content:center;
	}

	// bottom outline for selected trigger in tabs
	[aria-selected=true]::before{
		--indicator-color-fallback: transparent;
		height: 0px;
		background-color: transparent;
		background: transparent;
	}
	
	[data-part=trigger] {
		height: 50px;
		background-color: transparent;
		width: fit-content;
		// padding:5px;
		border-radius:0px;
	}

	&[data-selected] {
		background-color: blue;
	}

	.searcher-trigger{
		width: 22px;
		height: 22px;
		padding: 3px;
	}
	.searcher-trigger:hover{
		background-color: #eee;
	}
	
	input::placeholder{
		color: #bbb;
	}
`;

const inputStyle=css`
	outline: none;
	border: none;
	color: #222;
`;

const headerStyle=css`
	align-items: flex-start
	gap: 0;
	width: 100%;
	padding-left: 10px;
	padding-right: 10px;
	margin-bottom: 5px;

	background-color: white;
	border-radius: 12px;
	padding: 5px;
	border: 2px solid #555;
`;

const menuStyle=css`
	padding: 0;
	[aria-selected=true] {
		background-color: #eee;
		border-radius: 65px;
	}
	[aria-selected=true]::before {
		height: 0;
	}
`;

const GraphsViews:React.FC<any>=(props:any)=>{
	const{
		content,
	}=props;

	const{
		setViewId,setViews,
	}=useGraphCtx();
	
	return (
		<VStack p={0} m={0} h={'100%'} minH={0} w={'100%'} overflowY={'auto'}>
			{content.map(
				(gId:any,id:number)=>(
					<Box
						w={'100%'} alignItems={'stretch'}
						p={0}
						m={0}
						key={`${gId}+${id}`}
						onClick={async()=>{
							// correct place to change view id, not in brief card
							// TODO: delete setViewId in brief card
							if (setViewId&&setViews){
								await setViewId(gId)
								await setViews(undefined)
							}
						}}
						>
						<SpGraph.Root
							key={JSON.stringify(gId)+'k'}
							id={gId}
							defaultMode={'BRIEF'}
						>
							<SpGraph.Body/>
						</SpGraph.Root>
					</Box>
				)
			)}
		</VStack>
	)
}

export default function Searcher(props: any){
	const [perms,]=useState(undefined) as any;
	const{filters,w}=props;

	// TODO: merge variables
	const [promtLoading,setPromtLoading]=useState(false);
	const [promtActive,setPromtActive]=useState(false);
	const [promt,setPromt]=useState('');

	const parts = filters.tp.split('.');
	let gId = undefined as any;
	if(parts.length==2){
		if (perms===undefined){
			gId=parts[1]
		}
	}

	const [briefOpen,setBriefOpen]=useState(false) as any;
	const descriptionRef=useRef(null) as any;
	const descriptionInnerRef=useRef(null) as any;
	const nameRef=React.createRef() as any;
	const [gIdSave,]=useState(gId)
	const [currentFilters,setCurrentFilters] = useState(filters);
	const [searching,setSearching]=useState(true);
	const [content,setContent]=useState([]);
	const [currentTab,setCurrentTab]=useState(`${'g.'+gId||filters.tp}`)
	let tm = 0;
	const [isMobile,setIsMobile]=useState(false);

	useEffect(() => {
    const detectDevice = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth<500);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

	const changeContent=async(q:string)=>{
		let docs = [] as any;
		if (currentFilters.tp === 'users') {
			let queries = []
			if (q!=='') {
				queries=[
					Query.startsWith('username',q),
					Query.limit(100)
				]
			}else{
				queries=[
					Query.limit(100)
				]
			}
			const response = await spaced_databases.listDocuments(
				space_db_id,
				user_collection_id,
				queries,
			)
			docs = response.documents;
		} else if (currentFilters.tp==='graphs') {
			let queries = []
			if (q!=='') {
				queries=[
					Query.startsWith('name',q),
					Query.limit(10),
					Query.isNull('parentId'),
				]
			}else{
				queries=[
					Query.limit(10),
					Query.isNull('parentId'),
				]
			}
			const response = await spaced_databases.listDocuments(
				space_db_id,
				NAMESPACE_COLLECTION_ID,
				queries,
			)
			docs = response.documents.map((e:any)=>e.$id);
		}else if (currentFilters.tp==='nodes') {
			let queries = []
			if (q!=='') {
				queries=[
					Query.startsWith('txt',q),
					Query.orderDesc('$createdAt'),
					Query.limit(10),
				]
			}else{
				queries=[
					Query.limit(10),
					Query.orderDesc('$createdAt'),
				]
			}
			const response = await spaced_databases.listDocuments(
				space_db_id,
				NODES_COLLECTION_ID,
				queries,
			)
			console.log('response.documents',response.documents)
			docs = response.documents;
		}
		await setContent(docs);
		await setSearching(false);
	}

	useEffect(()=>{
		if (searching){
			changeContent('')
		}
	},[searching])

	const searcherInputRef=useRef<HTMLInputElement>(null);
	if (props===undefined){
		return <></>
	}

	if (gIdSave===undefined&&searching){
		changeContent('')
		return <></>
	}

	const marginBottom='' as any;

	if (gIdSave===undefined){
		return (
			<span
				// @ts-expect-error: eslint has no plugin for handling new props
				css={searcherStyle}
				style={{
					maxWidth: w,
					width:'100%',
					overflowY:'hidden',
					minHeight:'0',
					height: '100%',
					marginBottom: marginBottom,
				}}
				>
					<Tabs.Root
						size={'sm'}
						defaultValue={currentFilters.tp}
						variant={'subtle'}
						w={'100%'}
						p={0}
						h={'100%'}
						>
						<HStack w={'100%'} h={'fit-content'} p={0} gap={'8px'}>
							<Tabs.Trigger
								onClick={()=>{
									const newFilters = currentFilters
									newFilters.tp = 'users'
									setCurrentFilters(newFilters)
									setSearching(true);
									setCurrentTab(newFilters.tp);
								}}
								value="users">
								users
							</Tabs.Trigger>
							<Tabs.Trigger
								onClick={()=>{
									const newFilters = currentFilters
									newFilters.tp = 'nodes'
									setCurrentFilters(newFilters)
									setSearching(true);
									setCurrentTab(newFilters.tp);
									migrateData()
								}}
								value="nodes">
								nodes
							</Tabs.Trigger>
							<Tabs.Trigger
								value="graphs"
								onClick={()=>{
									const newFilters = currentFilters;
									newFilters.tp = 'graphs';
									setCurrentFilters(newFilters);
									setSearching(true);
									setCurrentTab(newFilters.tp);
								}}
								>
								courses
							</Tabs.Trigger>
	
							<Input
								css={inputStyle}
								w={'100%'}
								variant={'subtle'}
								ref={searcherInputRef}
								onChange={()=>{
									// when user is typing
									// searching starts but waits till user end his typing
									tm+=WAIT_USER_ACTION_TIME
									setTimeout(async()=>{
										// when user ends his typing we start to
										tm-=WAIT_USER_ACTION_TIME
										if (tm === 0) {
											const newQ = searcherInputRef.current?.value.toLowerCase()||'';
											changeContent(newQ);
										}
									}, WAIT_USER_ACTION_TIME)
								}}
								h='35px'
								placeholder={getSearchPlaceholer(currentFilters.tp)}
							/>
							{!isMobile&&
							<Button
								className="trigger-button"
								size={'xs'}
								fontSize={'12px'}
								p={'6px'}
								variant={'ghost'}
								onClick={async ()=>{
									const g_id = await createMyGraph({})
									History.push('/graph.'+g_id)
									store.dispatch({
										type: 'set_g_id',
										payload: g_id,
									})
								}}
								>
								<LuClipboardPlus/>
							</Button>
							}
						</HStack>
	
						<Separator orientation={'horizontal'} />
	
						<Tabs.Content
							value="users"
							p={0}
							h={'100%'}
							>
							<VStack
								align={'start'}
								h={'100%'}
								minH={0}
								overflowY={'auto'}
								gap={0}
								>
								{searching===false&&currentFilters.tp==='users'? (
									content.map((userData: any, k: number)=>{
										return (
											<Box key={k+JSON.stringify(userData)} className='full'>
												<UserCard
													key={k+JSON.stringify(userData)}
													userData={userData}
												/>
												<Separator
													w={'90%'}
													justifySelf={'flex-end'}
													opacity={0.5}
												/>
											</Box>
										)}
									)
								):(
									<Spinner size="sm" />
								)}
							</VStack>
							<Box
								minH={'100px'}
								h={'100px'}
								flexShrink={0}
								w={'100px'}
								backgroundColor={'transparent'}
							/>
						</Tabs.Content>
	
						<Tabs.Content
							value="graphs"
							p={0}
							h={'100%'}
							>
							<VStack
								align={'start'}
								h={'100%'}
								minH={0}
								overflowY={'auto'}
								gap={0}
								>
								{currentFilters&&
								currentFilters.tp=='graphs'&&
								searching===false?(
									content.map(
										(id: any)=>(
											<Box key={JSON.stringify(id)+'k'}
												className='full'
												minH={'fit-content'}
												h={'fit-content'}
												>
												<SpGraph.Root
													key={JSON.stringify(id)+'k'}
													id={id}
													isMobile={isMobile}
													defaultMode={'BRIEF'}
												>
													<SpGraph.Body>
													</SpGraph.Body>
												</SpGraph.Root>
												<Separator/>
											</Box>
										)
									)
								):(
									<Spinner size="sm"/>
								)}
							</VStack>
							<Box
								minH={'100px'}
								h={'100px'}
								flexShrink={0}
								w={'100px'}
								backgroundColor={'transparent'}
							/>
						</Tabs.Content>

						<Tabs.Content
							value="nodes"
							p={0}
							h={'100%'}
							>
							<VStack
								align={'start'}
								h={'100%'}
								minH={0}
								overflowY={'auto'}
								gap={0}
								>
								{currentFilters&&
								currentFilters.tp=='nodes'&&
								searching===false?(
									content.map(
										(n: any)=>{
											console.log('n:',n)
											return (
												<Box key={JSON.stringify(n.$id)+'k'}
													className='full'
													minH={'fit-content'}
													h={'fit-content'}
													>
													<SpContent content={n.forward.join(' ')}/>
													<SpContent content={n.backward.join(' ')}/>
												</Box>
											)
										}
									)
								):(
									<Spinner size="sm"/>
								)}
							</VStack>
							<Box
								minH={'100px'}
								h={'100px'}
								flexShrink={0}
								w={'100px'}
								backgroundColor={'transparent'}
							/>
						</Tabs.Content>
					</Tabs.Root>
				</span>
			)
		}

		const{
			g,setG,
			editor,
			feedRef,
			// eslint-disable-next-line
		}=useGraphCtx() as any;

		return (
			<span
				// @ts-expect-error: eslint has no plugin for handling new props
				css={searcherStyle}
				style={{
					maxWidth: w,
					width:'100%',
					overflowY:'hidden',
					minHeight:'0',
					marginBottom:marginBottom,
				}}
				>
				<Box w={'100%'} h={'100%'}>
					<Tabs.Root className='full' defaultValue={currentTab}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={50} minSize={20}>
								<VStack className='full' gap={0}>
									<Tabs.Content
										value={'g.'+gIdSave}
										className='full'
										p={0}
										overflowY={'hidden'}
										maxH={'100%'}
										>
										<SpEditorComponentCtx.Provider value={{
											currentFilters:currentFilters,setCurrentFilters:setCurrentFilters,
											searching:searching,setSearching:setSearching,
											currentTab:currentTab,setCurrentTab:setCurrentTab,
											content:content,setContent:setContent,
											searcherInputRef:React.createRef(),
										}}>
											<SpGraph.Editor
												filters={filters}
												ref={editor}
											/>
										</SpEditorComponentCtx.Provider>
									</Tabs.Content>

									<Tabs.Content value="users">
										{searching===false&&currentFilters.tp==='users'? (
											<VStack overflowY={'auto'}>
												{content.map((userData: any, k: number)=>{
													let dvalue='viewer' as string;
													if (perms&&perms.includes(userData.$id)===true){
														dvalue='editor'
													}
													return (
														<HStack key={k} w={'100%'} alignItems={'stretch'}>
															<UserCard userData={userData} />
															<Spacer/>
															{isGraphEditable()&&(
																<Box
																	w={'fit-content'}>
																	<Field.Root
																		p={0}
																		fontSize={'12px'}
																		>
																		<NativeSelect.Root
																			p={0}
																			>
																			<NativeSelect.Field
																				name="country"
																				fontSize={'12px'}
																				w={'fit-content'}
																				defaultValue={dvalue}
																				onChange={(e:any)=>{
																					if (e.target.value==='editor'){
																						grantEditPermission(gIdSave,userData.$id)
																					} else if (e.target.value==='viewer'){
																						// no access
																						revokeEditPermission(gIdSave,userData.$id)
																					}
																				}}
																				>
																				<For each={[
																						"viewer",
																						"editor",
																						"owner"
																					]}>
																					{(item) => (
																						<option
																							key={item} value={item}
																							style={{
																								width:'fit-content',
																							}}
																							>
																							{item}
																						</option>
																					)}
																				</For>
																			</NativeSelect.Field>
																			<NativeSelect.Indicator />
																		</NativeSelect.Root>
																	</Field.Root>
																</Box>
															)}
														</HStack>
													)}
												)}
											</VStack>
										):(
											<Spinner size="sm" />
										)}
									</Tabs.Content>

									<Tabs.Content value="graphs">
										{searching===false&&currentFilters.tp==='graphs'?(
											<GraphsViews content={content}/>
										):(
											<Spinner size="sm"/>
										)}
									</Tabs.Content>


									<VStack css={headerStyle}
										p={0}
										gap={0}
										m={'0px'}
										>
										<HStack w={'100%'} p={0}>
											{/* eslint-disable-next-line */}
											<div
												// @ts-expect-error: css not default prop
												css={inputStyle}
												role='textbox'
												tabIndex={0}
												className="SpTextarea"
												contentEditable
												onClick={()=>{
													setPromtActive(true)
												}}
												onBlur={()=>{
													setPromtActive(false)
												}}
												style={{
													width: '100%',
													padding:'5px',
													height: 'fit-content',
													backgroundColor:'transparent',
													color:'black'
												}}
												ref={searcherInputRef}
												suppressContentEditableWarning={true}
												onChange={()=>{
													// when user is typing
													// searching starts but waits till user end his typing
													tm+=WAIT_USER_ACTION_TIME
													setTimeout(async()=>{
														// when user ends his typing we start to
														tm-=WAIT_USER_ACTION_TIME
														if (tm === 0) {
															const newQ = searcherInputRef.current?.value.toLowerCase()||'';
															changeContent(newQ);
														}
													}, WAIT_USER_ACTION_TIME)
												}}
											>
												{(!promtLoading&&!promtActive&&promt.length===0)&&(
													<>{getSearchPlaceholer(currentFilters.tp)}</>
												)}
												{promtLoading&&(
													<Spinner size="sm" />
												)}
												{promtLoading===false&&(
													<>{promt}</>
												)}
											</div>
											<Button
												h={'30px'}
												w={'30px'}
												maxW={'30px'}
												rounded={'full'}
												backgroundColor={'blue'}
												color={'black'}
												onClick={async()=>{
													console.log('vars:',
														promtLoading,
														promtActive,
														promt)
													let ans='' as any;
													// send me 3 sentences with c1 vocabulary
													const f=async()=>{
														await setPromtLoading(true)
														const q=searcherInputRef.current?.innerText
														await setPromt('')
														if (searcherInputRef.current){
															const emptyTextNode = document.createTextNode('');
    													const nodeToReplace = searcherInputRef.current.childNodes[0];
															searcherInputRef.current.replaceChild(emptyTextNode, nodeToReplace);
														}

														let dialogueId='';
														if (!feedRef.current.isDialogueVisible()){
															dialogueId=ID.unique();
															const curIdx=feedRef.current.getCurrentPos()
															console.log('curIdx',curIdx)
															feedRef.current.insertCard(
																dialogueId,
																curIdx,
																[
																	{role:0,text:q},
																	{role:1,text:'',loading:true}
																],
															)

															console.log('model:',ans)
														}else{
															const ids=feedRef.current.getIds()
															dialogueId=ids[feedRef.current.getCurrentPos()].slice(4)
															feedRef.current.extendDialogue(
																dialogueId,
																[
																	{role:0,text:q},
																	{role:1,text:'',loading:true}
																],
															)
															
														}
														
														ans = await LLMreq(q,feedRef.current.getSelectedCards());
														feedRef.current.sendLLMAnswer(
															dialogueId,
															ans,
														)
														// await setPromt(ans)
														await setPromtLoading(false)
														// if (searcherInputRef.current){
														// 	searcherInputRef.current.innerText = ans
														// }
													}
													f()
												}}
											>
												<SendSVG
													className='custom-icon'
													width={'15px'} height={'15px'}
												/>
											</Button>
										</HStack>

										<HStack flexShrink={0} gap={0} w={'100%'}
											justifyContent={'center'}
											onClick={()=>{
												setBriefOpen((oldValue:any)=>!oldValue)
											}}
											>
											<Menu.Root defaultHighlightedValue={gIdSave}>
												<Menu.Trigger
													onClick={(e:any)=>{
														e.stopPropagation();
													}}
													className='searcher-trigger'
													asChild style={{
														padding:'5px',
														minWidth: '22px',
														minHeight: '22px',
													}}>
													<LuChevronDown style={{width: '15px'}}/>
												</Menu.Trigger>
												<Portal>
													<Menu.Positioner style={{zIndex:3000,width:'fit-content',}}>
														<Menu.Content
															css={menuStyle}
															p={0}
															minWidth='20px'
															rounded={'full'}
															>
															<Menu.Item value="users">
																<Tabs.Trigger
																	value="users"
																	w={'20px'}
																	h={'20px'}
																	p={0}
																	onClick={async ()=>{
																		const newFilters = currentFilters;
																		newFilters.tp = 'users';
																		await setCurrentFilters(newFilters);
																		await setSearching(true);
																		await setCurrentTab(newFilters.tp);
																	}}
																	>
																	<LuUser style={{
																		margin:'auto',
																		minHeight:'20px',height:'12px',
																		minWidth:'12px',width:'12px',
																	}}/>
																</Tabs.Trigger>
															</Menu.Item>
															<Menu.Item value="graphs">
																<Tabs.Trigger
																	w={'20px'}
																	h={'20px'}
																	p={0}
																	value="graphs"
																	onClick={async ()=>{
																		const newFilters = currentFilters;
																		newFilters.tp = 'graphs';
																		await setCurrentFilters(newFilters);
																		await setSearching(true);
																		await setCurrentTab(newFilters.tp);
																	}}
																	>
																	<LuFolder style={{
																		margin:'auto',
																		minHeight:'12px', height:'12px',
																		minWidth:'12px',width:'12px',
																	}}/>
																</Tabs.Trigger>
															</Menu.Item>
															<Menu.Item value={'g.'+gIdSave}>
																<Tabs.Trigger
																	w={'20px'}
																	h={'20px'}
																	p={0}
																	value={'g.'+gIdSave}
																	onClick={async ()=>{
																		const newFilters = currentFilters;
																		newFilters.tp = 'g.'+gIdSave;
																		await setCurrentFilters(newFilters);
																		await setSearching(true);
																		await setCurrentTab(newFilters.tp);
																	}}
																	>
																	<LuWaypoints style={{
																		margin:'auto',
																		minHeight:'12px', height:'12px',
																		minWidth:'12px',width:'12px',
																	}}/>
																</Tabs.Trigger>
															</Menu.Item>
														</Menu.Content>
													</Menu.Positioner>
												</Portal>
											</Menu.Root>

											{/* eslint-disable-next-line */}
											<div
												role='textbox'
												tabIndex={0}
												contentEditable
												suppressContentEditableWarning={true}
												ref={nameRef}
												onBlur={()=>{
													// const name = nameRef.current.innerText;
													g.name = nameRef.current.innerText;
													setG(g)
												}}
												onClick={(e:any)=>{
													e.preventDefault()
													e.stopPropagation()
												}}
												style={{
													width:'fit-content',
													height:'fit-content',
													backgroundColor:'var(--chakra-colors-bg-muted)',
													border:0,
													outline:0,
													fontWeight:600,
													fontSize:'13px',
													opacity:.85,
													paddingLeft:'5px',
													paddingRight:'5px',
													borderRadius:'5px',
													whiteSpace:'nowrap',
												}}
											>
												{g?.name}
											</div>
										</HStack>
										
										{briefOpen&&(
											<Box
												onClick={(e:any)=>{
													e.stopPropagation()
												}}
												style={{
													fontSize:'13px',
													overflowY:'auto',
													height:'fit-content',
													resize:'vertical',
													width:'100%',
													lineHeight:'1.2',
													opacity:'50%',
												}}
												>
												<SpInput.Root
													ref={descriptionRef}
													defaultValue={g!==undefined?g.description:''}
													input_ref={descriptionInnerRef}
													onBlur={()=>{
														const t=descriptionRef.current.getSpText() as string;
														g.description=t;
														setG(g)
													}}
													>
													<SpInput.Body/>
												</SpInput.Root>
											</Box>
										)}
									</VStack>
								</VStack>
							</Panel>
							

							{
								!isMobile&&<>
								<PanelResizeHandle
									style={{
										width:'10px',
										minHeight:'100%',
										display:'flex',
										alignItems:'center',
										opacity:.3,
										justifyContent:'center',
									}}>
									||
									</PanelResizeHandle>
									<Panel defaultSize={50} minSize={20}>
										<Box className='full'>
											<SpGraph.Body/>
										</Box>
									</Panel>
								</>
							}
						</PanelGroup>
					</Tabs.Root>
				</Box>
		</span>
	)
}