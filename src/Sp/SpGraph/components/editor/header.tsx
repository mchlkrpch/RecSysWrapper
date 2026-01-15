import React from "react";
// import React, { useEffect, useState } from "react";
// import { useGraphCtx } from "../../context";
// import { useRef } from "react";
// import {
// 	Box,
// 	HStack,
// 	Input,
// 	Menu,
// 	Portal,
// 	Tabs,
	// Breadcrumb,
	// Button,
	// HStack,
	// Menu,
	// Portal,
// 	VStack
// } from "@chakra-ui/react";
// import { LuChevronDown,
// 	LuMenu,
// 	LuSave
// } from "react-icons/lu";
// import {
// 	__render_edit,
// 	__save_brief,
// 	__save_config,
// 	__save_nodes
// } from "../../utils";
// import { NAMESPACE_COLLECTION_ID } from "../../../../utils/appwrite";
// import {
// 	deleteGraph,
// 	space_db_id,
// 	spaced_databases
// } from "../../../../utils/appwrite";
// import { Informate } from "../../../../components/info";
// import { History } from "../../../../utils/history";
// import SpInput from "../../../SpInput/SpInput";
// import { LuChevronDown, LuFolder, LuUser, LuWaypoints } from "react-icons/lu";

// /** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';
// import { Query } from "appwrite";
// import { NAMESPACE_COLLECTION_ID, space_db_id, spaced_databases, user_collection_id } from "../../../../utils/appwrite";
// import { useSpEditorComponentCtx } from "./context";

// const WAIT_USER_ACTION_TIME = 500;
// const inputStyle=css`
// 	outline: none;
// 	border: none;
// `;

// const headerStyle=css`
// 	align-items: flex-start
// 	gap: 0;
// 	padding-left: 10px;
// 	padding-right: 10px;
// 	margin-bottom: 5px;

// 	background-color: white;
// 	border-radius: 10px;
// 	padding: 5px;
// 	margin-top: 5px;
// 	border: 1px solid #ddd;
// `;

// const getSearchPlaceholer=(tp:string)=>{
// 	switch(tp){
// 		case 'graphs':{
// 			return 'search graphs';
// 		}
// 		case 'users':{
// 			return 'search users';
// 		}
// 		default:
// 			return 'search nodes';
// 	}
// }

const Header: React.FC=()=>{
	// const {
	// 	// id,viewId,
	// 	g,setG,
	// 	// viewId,
	// 	// ns,setViewId,setViews,
	// } = useGraphCtx() as any;

	// const {
	// 	currentFilters,setCurrentFilters,
	// 	// searching,
	// 	setSearching,
	// 	currentTab,setCurrentTab,
	// 	searcherInputRef,
	// 	// setContent,
	// }=useSpEditorComponentCtx() as any;

	// const nameRef = useRef(null) as any;
	// const descriptionInnerRef=useRef(null) as any;
	// const descriptionRef = useRef(null) as any;
	// const[briefOpen,setBriefOpen]=useState(true);

	// useEffect(()=>{
	// 	if (g){
	// 		if (descriptionRef.current){
	// 			descriptionRef.current.setContent(g.description)
	// 			setBriefOpen(false);
	// 		}
	// 	}
	// 	setG(g)
	// },[g,setG])

	// const tm = 0;

	// const changeContent=async(q:string)=>{
	// 	let docs = [] as any;
	// 	if (currentFilters.tp === 'users') {
	// 		let queries = []
	// 		if (q!=='') {
	// 			queries=[
	// 				Query.startsWith('username',q),
	// 				Query.limit(10)
	// 			]
	// 		}else{
	// 			queries=[
	// 				Query.limit(10)
	// 			]
	// 		}
	// 		const response = await spaced_databases.listDocuments(
	// 			space_db_id,
	// 			user_collection_id,
	// 			queries,
	// 		)
	// 		docs = response.documents
	// 	} else if (currentFilters.tp==='graphs') {
	// 		let queries = []
	// 		if (q!=='') {
	// 			queries=[
	// 				Query.startsWith('name',q),
	// 				Query.limit(10)
	// 			]
	// 		}else{
	// 			queries=[
	// 				Query.limit(10)
	// 			]
	// 		}
	// 		const response = await spaced_databases.listDocuments(
	// 			space_db_id,
	// 			NAMESPACE_COLLECTION_ID,
	// 			queries,
	// 		)
	// 		docs = response.documents.map((e:any)=>e.$id)
	// 	}
	// 	await setContent(docs);
	// 	await setSearching(false);
	// }
	// useEffect(() => {
	// 	if (searching === true && g && currentTab !== g.id) {
	// 		changeContent('');
	// 	}
	// }, [searching, g, currentTab, setContent, setSearching]);

	// const [,setGName]=useState('');
	// useEffect(()=>{
	// 	if (g){
	// 		setGName(g.name);
	// 	}
	// },[g])
	return (<></>)

	// return (
	// 	<VStack css={headerStyle}>
	// 		<Input
	// 			css={inputStyle}
	// 			w={'100%'}
	// 			p={'5px'}
	// 			backgroundColor={'transparent'}
	// 			borderRadius={'5px'}
	// 			variant={'subtle'}
	// 			ref={searcherInputRef}
	// 			onChange={()=>{
	// 				// when user is typing
	// 				// searching starts but waits till user end his typing
	// 				tm+=WAIT_USER_ACTION_TIME
	// 				setTimeout(async()=>{
	// 					// when user ends his typing we start to
	// 					tm-=WAIT_USER_ACTION_TIME
	// 					if (tm === 0) {
	// 						const newQ = searcherInputRef.current?.value.toLowerCase()||'';
	// 						changeContent(newQ);
	// 					}
	// 				}, WAIT_USER_ACTION_TIME)
	// 			}}
	// 			h='35px'
	// 			placeholder={getSearchPlaceholer(currentFilters.tp)}
	// 		/>
	// 		<HStack flexShrink={0} gap={0}>
	// 			<Menu.Root defaultHighlightedValue={viewId}>
	// 				<Menu.Trigger
	// 					className='searcher-trigger'
	// 					asChild style={{
	// 						padding:'5px',
	// 						minWidth: '22px',
	// 						minHeight: '22px',
	// 					}}>
	// 					<LuChevronDown style={{width: '15px'}}/>
	// 				</Menu.Trigger>
	// 				<Portal>
	// 					<Menu.Positioner style={{
	// 							zIndex:3000,
	// 							width:'fit-content',
	// 						}}>
	// 						<Menu.Content
	// 							p={0}
	// 							// backgroundColor='yellow'
	// 							minWidth='20px'
	// 							rounded={'full'}
	// 							>
	// 							<Menu.Item value="users">
	// 								<Tabs.Trigger
	// 									value="users"
	// 									w={'20px'}
	// 									h={'20px'}
	// 									p={0}
	// 									onClick={async ()=>{
	// 										const newFilters = currentFilters;
	// 										newFilters.tp = 'users';
	// 										await setCurrentFilters(newFilters);
	// 										await setSearching(true);
	// 										await setCurrentTab(newFilters.tp);
	// 									}}
	// 									>
	// 									<LuUser style={{
	// 										margin:'auto',
	// 										minHeight:'20px',height:'12px',
	// 										minWidth:'12px',width:'12px',
	// 									}}/>
	// 								</Tabs.Trigger>
	// 							</Menu.Item>
	// 							<Menu.Item value="graphs">
	// 								<Tabs.Trigger
	// 									w={'20px'}
	// 									h={'20px'}
	// 									p={0}
	// 									value="graphs"
	// 									onClick={async ()=>{
	// 										const newFilters = currentFilters;
	// 										newFilters.tp = 'graphs';
	// 										await setCurrentFilters(newFilters);
	// 										await setSearching(true);
	// 										await setCurrentTab(newFilters.tp);
	// 									}}
	// 									>
	// 									<LuFolder style={{
	// 										margin:'auto',
	// 										minHeight:'12px', height:'12px',
	// 										minWidth:'12px',width:'12px',
	// 									}}/>
	// 								</Tabs.Trigger>
	// 							</Menu.Item>
	// 							<Menu.Item value={viewId}>
	// 								<Tabs.Trigger
	// 									w={'20px'}
	// 									h={'20px'}
	// 									p={0}
	// 									value={viewId}
	// 									onClick={async ()=>{
	// 										const newFilters = currentFilters;
	// 										newFilters.tp = 'g.'+viewId;
	// 										await setCurrentFilters(newFilters);
	// 										await setSearching(true);
	// 										await setCurrentTab(viewId);
	// 									}}
	// 									>
	// 									{/* {gName} */}
	// 									<LuWaypoints style={{
	// 										margin:'auto',
	// 										minHeight:'12px', height:'12px',
	// 										minWidth:'12px',width:'12px',
	// 									}}/>
	// 								</Tabs.Trigger>
	// 							</Menu.Item>
	// 						</Menu.Content>
	// 					</Menu.Positioner>
	// 				</Portal>
	// 			</Menu.Root>
	// 			{currentFilters.tp==='g.'+viewId&&
	// 			// eslint-disable-next-line
	// 			<div
	// 				role='textbox'
	// 				tabIndex={0}
	// 				contentEditable
	// 				suppressContentEditableWarning={true}
	// 				ref={nameRef}
	// 				onBlur={()=>{
	// 					// const name = nameRef.current.innerText;
	// 				}}
	// 				onClick={(e:any)=>{
	// 					e.preventDefault()
	// 					e.stopPropagation()
	// 				}}
	// 				style={{
	// 					width:'fit-content',
	// 					height:'fit-content',
	// 					backgroundColor:'var(--chakra-colors-bg-muted)',
	// 					border:0,
	// 					outline:0,
	// 					fontWeight:600,
	// 					fontSize:'13px',
	// 					opacity:.85,
	// 					paddingLeft:'5px',
	// 					paddingRight:'5px',
	// 					borderRadius:'5px',
	// 					whiteSpace:'nowrap',
	// 				}}
	// 			>
	// 				{gName}
	// 			</div>}
	// 		</HStack>
			
	// 		{briefOpen&&(
	// 			<Box
	// 				style={{
	// 					fontSize:'13px',
	// 					overflowY:'auto',
	// 					height:'fit-content',
	// 					resize:'vertical',
	// 					width:'100%',
	// 					lineHeight:'1.2',
	// 					opacity:'50%',
	// 				}}
	// 				>
	// 				<SpInput.Root
	// 					ref={descriptionRef}
	// 					defaultValue={g!==undefined?g.description:''}
	// 					input_ref={descriptionInnerRef}
	// 					onBlur={()=>{
	// 						const t=descriptionRef.current.getSpText() as string;
	// 						g.description=t;
	// 						setG(g)
	// 					}}
	// 					>
	// 					<SpInput.Body/>
	// 				</SpInput.Root>
	// 			</Box>
	// 		)}
	// 	</VStack>
	// )
}

// const Header = React.memo(HeaderFC)
// const Header=HeaderFC

export default Header;