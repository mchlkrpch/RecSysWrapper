import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useGraphCtx } from "./context";
import SpGraphBriefCard from "./components/briefcard";
import {
	__fetch_nodes,
	__fetch_views,
	__recalc__graph,
	__render_brief,
	__render_edit,
	__save_config,
	__wrap_data_to_node,
	NodeHeight,
	NodeWidth
} from "./utils";
import {
	Box,
	Button,
	Card,
	Checkbox,
	HStack,
	Input,
	Menu,
	Portal,
	Spacer,
	Spinner,
	Text,
} from "@chakra-ui/react";
import {
	applyNodeChanges,
	getSmoothStepPath,
	Handle,
	Position,
	ReactFlow,
	ReactFlowProvider,
	SelectionMode,
	useNodes,
	useReactFlow,
	useViewport
} from "@xyflow/react";
import { ViewportDisplay } from "../../utils/utils";
import {
	PanelGroup,
} from "react-resizable-panels";
import {
	DarkMode,
	LightMode,
	useColorMode
} from "../ui/color-mode";
import { SpContent } from "../SpInput/body";
import { createMyGraph, NAMESPACE_COLLECTION_ID, space_db_id, spaced_client, spaced_databases, user_collection_id } from "../../utils/appwrite";

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { LuChevronRight } from "react-icons/lu";
import { Query } from "appwrite";
import store from "../../storage";
import { History } from "../../utils/history";

const dropMenuStyle=css`
	background-color: #1e1e1e;
	border-style: solid;
	box-shadow: 10px 19px 20px rgba(0, 0, 0, 10%);
	position: absolute;
	z-index: 3200;
	border-radius: 8px;
	gap:-5px;
	padding: 5px;

	font-size: 11px;
	color: rgba(255,255,255,0.5);

	[data-part=item]{
		color: #ddd;
		padding:0px;
	}
	[data-part=trigger-item]{
		color: #ddd;
		padding:0px;
	}

	[data-part=content]{
		z-index: 3220 !important;
	}

	[data-part=item]:hover{
		background-color: #3e3e3e;
	}
`;

// function ContextMenu({ onClose, x,y,nodeId,type, }: any) {
// 	const { setNs } = useGraphCtx() as any;
// 	const handleDeleteNode = () => {
// 		setNs((currentNs: any) => currentNs.filter((n: any) => n.id !== nodeId));
// 		onClose();
// 	};
// 	const handleDeleteSelection = () => {
// 		onClose();
// 	};
// 	const changeTypeSelection(newType:any)=>{
// 	}
// 	const renderMenuItems: any=()=>{
// 		switch (type) {
// 			case 'node':
// 				return (
// 					<>
// 						node action
// 						<Menu.Item value='double'>copy node</Menu.Item>
// 						<Menu.Item value='delete' color="red.500" onClick={handleDeleteNode}>
// 							Удалить узел
// 						</Menu.Item>
// 					</>
// 				);
// 			case 'selection':
// 				return (
// 					<>
// 						selection action
// 						<Menu.Item value='double'>copy selection</Menu.Item>
// 						<Menu.Item value='delete' color="red.500" onClick={handleDeleteSelection}>
// 							delete selection
// 						</Menu.Item>
// 						<Menu.Item value='delete' color="red.500" onClick={changeTypeSelection('Task')}>
// 							make Task
// 						</Menu.Item>
// 						<Menu.Item value='delete' color="red.500" onClick={changeTypeSelection('Def')}>
// 							make Def
// 						</Menu.Item>
// 						<Menu.Item value='delete' color="red.500" onClick={changeTypeSelection('Th')}>
// 							make Th
// 						</Menu.Item>
// 						<Menu.Item value='group'>group up</Menu.Item>
// 					</>
// 				);
// 			case 'pane':
// 				return (
// 					<>
// 						pane action
// 						<Menu.Item value='new'>add new</Menu.Item>
// 						<Menu.Item value='ctrlV'>paste</Menu.Item>
// 					</>
// 				);
// 			default:
// 				return null;
// 		}
// 	};
// 	return (
// 		<div
// 			css={dropMenuStyle}
// 			// className='drop-menu'
// 			className="context-menu"
// 			style={{
// 				position: 'absolute',
// 				left: x,
// 				top: y,
// 			}}>
// 			<Menu.Root>
// 				{renderMenuItems()}
// 			</Menu.Root>
// 		</div>
// 	);
// }

function ContextMenu({ onClose, x, y, nodeId, type, selectedIdsRef }: any) {
	const {
		setNs,
		editor,
		setViews,
		viewId,
		g,setG,ns,
		views,
	} = useGraphCtx() as any;
	const viewNameRef=React.createRef() as any;
	const viewDescrRef=React.createRef() as any;

	const handleDeleteNode=()=>{
		setNs((currentNs: any)=>currentNs.filter((n: any)=>n.id !== nodeId));
		onClose();
	};

	const handleDeleteSelection = () => {
		const selectedIds = selectedIdsRef.current;
		if (!selectedIds || selectedIds.size === 0) {
			onClose();
			return;
		}
		setNs((currentNs: any) => currentNs.filter((n: any) => !selectedIds.has(n.id)));
		onClose();
	};

	const changeTypeSelection = async (newType: string) => {
		const selectedIds = selectedIdsRef.current;
		if (!selectedIds || selectedIds.size === 0) {
			onClose();
			return;
		}
		const newNs = [] as any;
		await setNs((currentNs: any[]) => {
			return currentNs.map(node => {
				if (selectedIds.has(node.id)) {
					const newNode={
						...node,
						type: newType,
						data: {
							...node.data,
							tp: newType,
						}
					};
					newNs.push(newNode);
				}
				return node;
			});
		});
		editor.current.show(newNs.map((n:any)=>n.data));
	};

	const renderMenuItems: any = () => {
		switch (type) {
			case 'node':
				return (
					<>
						node action
						<Menu.Item value='double'>copy node</Menu.Item>
						<Menu.Item value='delete' color="red.500" onClick={handleDeleteNode}>
							Удалить узел
						</Menu.Item>
					</>
				)
			case 'selection':
				return (
					<>
						selection action
						<Menu.Item value='double'>copy selection</Menu.Item>
						<Menu.Item value='delete' color="red.500" onClick={handleDeleteSelection}>
							delete selection
						</Menu.Item>
						{/* 5. Исправляем вызов в onClick */}
						<Menu.Item value='makeTask' onClick={() => changeTypeSelection('Task')}>
							make Task
						</Menu.Item>
						<Menu.Item value='makeDef' onClick={() => changeTypeSelection('Def')}>
							make Def
						</Menu.Item>
						<Menu.Item value='makeTh' onClick={() => changeTypeSelection('Th')}>
							make Th
						</Menu.Item>
						
						{/* <Menu.Item value='group'>group up</Menu.Item> */}
						<Menu.Root
							// @ts-expect-error no css in default jsx
							css={dropMenuStyle}
							style={{padding:0}}
							>
              <Menu.TriggerItem style={{
									color: '#ddd',
									padding:0,
									height: 'fit-content',
								}}>
                group up <Spacer/><LuChevronRight />
              </Menu.TriggerItem>
              <Portal>
                <Menu.Positioner
									className='context-menu'
									style={{
										zIndex: '3220',
										padding:0,
									}}
									>
                  <Menu.Content
										className='context-menu'
										>
										group name
										<Input
											ref={viewNameRef}
											className='drop-menu-input'
											placeholder="name of group"
											onKeyDown={(e:any)=>{
												e.stopPropagation()
											}}
										/>
										group info
										<Input
											ref={viewDescrRef}
											className='drop-menu-input'
											placeholder="description"
											onKeyDown={(e:any)=>{
												e.stopPropagation()
											}}
										/>
                    <Button
											onClick={async()=>{
												const g_id=await createMyGraph({
													ns: Array.from(selectedIdsRef.current),
													parentId: viewId,
													name: viewNameRef.current.value,
													description: viewDescrRef.current.value,
												})
												setViews((curViews:any)=>[...curViews,g_id])
											}}
											>
											add
										</Button>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
						<Menu.Root
							// @ts-expect-error no css in default jsx
							css={dropMenuStyle}
							style={{padding:0}}
							>
              <Menu.TriggerItem style={{
									color: '#ddd',
									padding:0,
									height: 'fit-content',
								}}>
                edit groups <Spacer/><LuChevronRight />
              </Menu.TriggerItem>
              <Portal>
                <Menu.Positioner
									className='context-menu'
									style={{
										zIndex: '3220',
										padding:0,
									}}
									>
                  <Menu.Content className='context-menu'>
										{views&&(
											views.map((view:any,i:number)=>{
												return (
													<Checkbox.Root
														key={view.$id}
														onCheckedChange={async(e)=>{
															let oldIds=view.nodeIds;
															if(e.checked){
																oldIds=Array.from(
																	new Set(
																		oldIds.concat(Array.from(selectedIdsRef.current))
																	))
																if (view.nodeIds!=oldIds){
																	const s =new Set(oldIds);
																	const selectedNs=ns.filter((n:any)=>s.has(n.id))
																	await __save_config(selectedNs,view.$id);
																}
																view.nodeIds=oldIds;
																views[i]=view
																await setViews(views)
																g.views[view.$id]=oldIds
																setG(g)
															}else{
																const s=new Set(selectedIdsRef.current);
																oldIds=oldIds.filter((id:any)=>!s.has(id));
																view.nodeIds=oldIds;
																views[i]=view
																await setViews(views)
																g.views[view.$id]=oldIds
																setG(g)

																const newS =new Set(oldIds);
																const selectedNs=ns.filter((n:any)=>newS.has(n.id))
																await __save_config(selectedNs,view.$id);
															}
														}}
													>
														<Checkbox.HiddenInput/>
														<Checkbox.Control />
														<Checkbox.Label>{view.name}</Checkbox.Label>
													</Checkbox.Root>
												)
											})
										)}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
						</Menu.Root>
					</>
				);
			case 'pane':
				return (
					<>
						pane action
						<Menu.Item value='new'>add new</Menu.Item>
						<Menu.Item value='ctrlV'>paste</Menu.Item>
					</>
				);
			default:
				return null;
		}
	};

	return (
		<div
			// @ts-expect-error no css prop in default js
			css={dropMenuStyle}
			className="context-menu"
			style={{
				position: 'absolute',
				left: x,
				top: y,
			}}>
			<Menu.Root>
				{renderMenuItems()}
			</Menu.Root>
		</div>
	);
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}


const GroupBoundary = ({ nodeIds, name }: { nodeIds: string[], name: string }) => {
  const allNodes = useNodes();
  const { x: viewX, y: viewY, zoom } = useViewport();
	// @ts-expect-error chill
  const graphBoundingBox = useMemo<BoundingBox | null>(()=>{
		if (nodeIds){

			const groupNodes = allNodes.filter((node) => nodeIds.includes(node.id));
	
			if (groupNodes.length === 0) {
				return null;
			}
	
			const initialBox = {
				minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity,
			};
	
			const { minX, minY, maxX, maxY } = groupNodes.reduce((box, node) => {
				const nodeWidth = node.width || NodeWidth;
				const nodeHeight = node.height || NodeHeight;
	
				return {
					minX: Math.min(box.minX, node.position.x),
					minY: Math.min(box.minY, node.position.y),
					maxX: Math.max(box.maxX, node.position.x + nodeWidth),
					maxY: Math.max(box.maxY, node.position.y + nodeHeight),
				};
			}, initialBox);
	
			const padding = 25;
	
			return {
				x: minX - padding,
				y: minY - padding,
				width: maxX - minX + padding * 2,
				height: maxY - minY + padding * 2,
			};
		}
		return {};
  } , [allNodes, nodeIds]);

  if (!graphBoundingBox) {
    return null;
  }

  const screenStyle = {
    position: 'absolute' as const,
    // Применяем трансформацию viewport к нашему bounding box
    left: `${graphBoundingBox.x * zoom + viewX}px`,
    top: `${graphBoundingBox.y * zoom + viewY}px`,
    width: `${graphBoundingBox.width * zoom}px`,
    height: `${graphBoundingBox.height * zoom}px`,
  };

  // 5. Рендерим div с вычисленными экранными координатами.
  return (
    <Box
      style={screenStyle}
      border="2px dashed"
      borderColor="purple.200"
      borderRadius="lg"
      // backgroundColor="purple.100" // Сделаем чуть прозрачнее
      pointerEvents="none"
      zIndex={-1}
    >
      {/* Масштабируем шрифт вместе с зумом, но с ограничениями, чтобы он не исчезал */}
      <Text
        p={2}
        fontSize={`${Math.max(0.6, Math.min(1.2, 1 * zoom))}rem`}
        fontWeight="bold"
        color="purple.400"
        opacity={zoom > 0.3 ? 0.8 : 0} // Скрываем текст при сильном отдалении
        transition="opacity 0.2s"
      >
        {name}
      </Text>
    </Box>
  );
};

export const SpDefinition = (card: any) => {
	const{
		data,
	}=card;

	const {
		editViewMode,
	} = useGraphCtx() as any;

	if (!data.tp){
		data.tp='Def'
	}
	
	const {
		colorMode
	} = useColorMode();

	// 1. Извлекаем только первую строку текста. Добавляем проверку на случай, если data.forward[0] пуст.
	const firstLine = data.forward[0] ? data.forward[0].split('\n')[0] : '';
	let calcPadding = '3px'
	if (editViewMode === 'repeat') {
		calcPadding = '3px';
	}

	const content = (
		<Box
			backgroundColor={'transparent'}
		>
			<Box>
				<Handle
					type='target'
					position={Position.Top}
					style={{ top: '50%', opacity: '0%', }}
					isConnectable={false}
				/>

				<Handle
					type="source"
					style={{ top: '50%', opacity: '0%', }}
					position={Position.Top}
					isConnectable={false}
				/>
			</Box>
			<Card.Root
				className={`SpDef-frame feed-block-${data.tp}`}
				borderRadius={'full'}
				// 2. Устанавливаем максимальную ширину и высоту для ноды.
				maxW={`${NodeWidth}px`}
				w={`${NodeWidth}px`}
				h={`${NodeHeight}px`}
				display={'flex'}
				alignContent={'center'}
				alignItems={'center'}
				p={calcPadding}
			>
				{/* 3. Применяем стили для усечения текста к Card.Header */}
				<Card.Header
					p={0}
					pl={'13px'}
					pr={'13px'}
					overflow={'hidden'}      // Скрываем все, что не помещается
					whiteSpace={'nowrap'}    // Запрещаем перенос текста
					lineClamp="1"
					mt={'auto'}
					mb={'auto'}
					maxW={`${NodeWidth}`}
				>
					<SpContent content={firstLine} isInner={true}/>
				</Card.Header>
				{editViewMode === 'repeat' &&
					<HStack
						ml={'auto'} mr={'auto'}
					>
						<Text
							fontSize={'10px'}
							opacity={0.4}
						>
							{/* {progress[data.id].float} */}
						</Text>
					</HStack>
				}
			</Card.Root>
		</Box>
	)

	if (colorMode == 'light') {
		return (
			<LightMode>
				{content}
			</LightMode>
		)
	}
	return (
		<DarkMode>
			{content}
		</DarkMode>
	);
};

export function SpEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	// @ts-expect-error: expected style parameter by default
	// eslint-disable-next-line
	style = {},
	markerEnd,
	selected,
	borderRadius = 15,
}: any) {
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius,
	});

	return (
		<>
			<path
				id={id}
				className="SpEdge"
				d={edgePath}
				
				strokeWidth={selected ? 2 : 1.5}
				markerEnd={markerEnd}
			/>
			<path
				d={edgePath}
				fill="none"
				stroke="transparent"
				strokeWidth={18}
			/>
		</>
	);
}

const nodeTypes = {
	SpDef:  SpDefinition,
}
const edgeTypes = {
	SpEdge: SpEdge,
}

// function ContextMenu({
// 	id,
// 	top,
// 	left,
// 	onClose, // We will use this prop
// 	...props
// }: any) {
// 	const { getNode, addNodes } = useReactFlow();
// 	// Only get the setter function from the context. We don't need to read `ns` here.
// 	const { setNs } = useGraphCtx(); 

// 	const duplicateNode = useCallback(() => {
// 		const node = getNode(id);
// 		if (node) {
// 			const position = {
// 				x: node.position.x + 50,
// 				y: node.position.y + 50,
// 			};
			
// 			// Important: a duplicated node needs a new unique ID in its data as well
// 			const newNodeData = JSON.parse(JSON.stringify(node.data));
// 			newNodeData.id = `${node.id}-copy`;

// 			const newNode = {
// 				...node,
// 				id: `${node.id}-copy`,
// 				position,
// 				selected: false,
// 				dragging: false,
// 				data: newNodeData,
// 			};
// 			// Update the main state using the functional
// 			// form to avoid race conditions
// 			setNs((currentNodes) => [...currentNodes, newNode]);
// 		}
// 		onClose(); // Close the menu after the action
// 	}, [id, getNode, setNs, onClose]);

// 	const deleteNode = useCallback(() => {
// 		// Use the functional update form.
// 		// `currentNs` is guaranteed by React to be the most recent state.
// 		setNs((currentNs) => {
// 			const newNs = currentNs.filter((node: any) => node.id !== id);
// 			return newNs;
// 		});

// 		onClose(); // Close the menu after the action
// 	}, [id, setNs, onClose]);

// 	return (
// 		<div
// 			className="context-menu"
// 			style={{ top: top, left: left }}
// 			{...props}
// 		>
// 			<button onClick={duplicateNode}>duplicate</button>
// 			<button onClick={deleteNode}>delete</button>
// 		</div>
// 	);
// }

const SpBodyFC=()=>{
	const {
		editor,
		ns,setNs,setSaveNs,
		es,setEs,
		views,
		setNodesToSave,
	} = useGraphCtx() as any;
	const gRef=useRef(null) as any;
	const selectedIdsRef = useRef(new Set());
	const [menu, setMenu] = useState<{
		x: number,
		y: number,
		type: 'node' | 'selection' | 'pane',
		nodeId?: string
	} | null>(null);
	const onNodeContextMenu = useCallback(
    (event:any,node:any)=>{
      event.preventDefault();
      const pane = gRef.current.getBoundingClientRect();
      setMenu({
				type:'node',
        nodeId: node.id,
        x: event.clientX-pane.left,
        y: event.clientY-pane.top,
      });
    },
    [setMenu],
  );
	const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		const selectionRectElement = gRef.current?.querySelector(
			'.react-flow__nodesselection-rect'
		) as HTMLElement | null;

		const position = {
			x: event.clientX,
			y: event.clientY,
		};

		if (selectionRectElement && selectedIdsRef.current.size > 0) {
			const rectBounds = selectionRectElement.getBoundingClientRect();
			const isInside = 
					position.x >= rectBounds.left &&
					position.x <= rectBounds.right &&
					position.y >= rectBounds.top &&
					position.y <= rectBounds.bottom;

			if (isInside) {
				const pane = gRef.current.getBoundingClientRect();
				setMenu({
						x: event.clientX - pane.left,
						y: event.clientY - pane.top,
						type: 'selection',
				});
				return;
			}
		}
		const pane = gRef.current.getBoundingClientRect();
		setMenu({
				x: event.clientX - pane.left,
				y: event.clientY - pane.top,
				type: 'pane',
		});
	}, [selectedIdsRef])
	const handleCloseMenu = () => setMenu(null);

	const onNodesChange = async (changes: any) => {
		changes=changes.filter((ch:any)=>ch.type!=='position');
		let removeFlag=false;
		let addFlag=false;
		for (const ch of changes) {
			if (ch.type==='select') {
				if (ch.selected ===true) {
					await selectedIdsRef.current.add(ch.id)
				} else {
					selectedIdsRef.current.delete(ch.id)
					// delete node from parent's list of ids:
					setSaveNs((saveNs:any)=>saveNs.filter((n:any)=>n.id!==ch.id))
				}
			}
			if (ch.type==='remove'){
				removeFlag=true;
			}
			if (ch.type==='add'){
				addFlag=true;
			}
		}
		if (addFlag||removeFlag){
			setNs(applyNodeChanges(changes, ns))
		}
	}

	const onPaneClick = async ()=>{
		handleCloseMenu();
		const f = async ()=>{
			// remove reactflow box selection
			const selection_box = gRef.current!.querySelector(
				'.react-flow__nodesselection-rect'
			) as any
			if (selection_box) {
				selection_box.style.display='none'
			}
		}
		await f()
		const existsIds = ns.map((n:any)=>n.id);
		if (editor&&editor.current){
			const cs = editor.current.getCards();

			setNodesToSave((s:any)=>{
				if (cs){
					const mergedSet = new Set([...s, ...cs.map((c:any)=>c.id)]);
					return mergedSet;
				}
				return []
			})

			let newCs = []
			if (cs !== undefined) {
				newCs = cs.filter((n:any)=>!existsIds.includes(n.id))
			}
			// update view's node ids:
			console.log('views:',views, editor)
			const curViewId=editor.current.getCurrentViewId()
			console.log('curViewId',curViewId)
			if (curViewId){
				const newViews=views.map((v:any)=>{
					if (v.$id===curViewId){
						console.log('newCs',newCs.map((n:any)=>n.id))
						v.nodeIds.push(...newCs.map((n:any)=>n.id))
					}
					return v;
				})
				console.log('newViews',newViews)
			}
			
			let newNs = await JSON.parse(JSON.stringify(ns))
			if (editor.current&&editor.current.getRefs()){
				editor.current.getRefs()?.map((_r:any, i:number)=>{
					const card = cs[i]
					newNs = newNs.map((n:any)=>{
						if (n.id==card.id) {
							n.data = card
						}
						return n;
					})
				})
			}
	
			newCs.map((data:any)=>{
				const n = __wrap_data_to_node(data)
				newNs.push(n)
			})
			console.log('editor.current',editor.current)
			if (editor.current) {
				editor.current.show([])
			}

			selectedIdsRef.current=new Set();

			const [recalcNs,recalcEs]=__recalc__graph(newNs.map((n:any)=>n.data));
			setNs([...recalcNs]);
			setEs([...recalcEs]);
		}
	}

	const onSelectionEnd = async ()=>{
		const cards = ns.filter((n:any)=>selectedIdsRef.current.has(
			n.id)).map((n:any)=>n.data)
		if (editor&&editor.current){
			await editor.current.show(cards)
		}
	}

	const handleKeyDown = (event: any) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
			const newNs = ns.filter((n:any)=>!selectedIdsRef.current.has(n.id))
			if (editor){
				const cards = editor.current.getCards();
				const newCs = cards.filter((n:any)=>!selectedIdsRef.current.has(n.id))
				editor.current.show(newCs);
			}
			setNs(newNs)
    }
  };
  const {  setViewport, getViewport, getZoom } = useReactFlow();
  const flowRef = useRef(null) as any;

  const handleWheel = useCallback((event:any) => {
    if (event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();

      const zoomSensitivity = 0.005;
      const currentZoom = getZoom();
      const currentViewport = getViewport();
      const zoomDelta = -event.deltaY * zoomSensitivity;
      const newZoom = Math.max(0.1, Math.min(4, currentZoom * (1 + zoomDelta)));
      // cursor position accoring to Flow
      const reactFlowBounds = flowRef.current.getBoundingClientRect();
      const cursorScreenX = event.clientX - reactFlowBounds.left;
      const cursorScreenY = event.clientY - reactFlowBounds.top;
      // convert screen coords to graph coords
      const graphX = (cursorScreenX - currentViewport.x) / currentZoom;
      const graphY = (cursorScreenY - currentViewport.y) / currentZoom;

      const newViewportX = cursorScreenX - graphX * newZoom;
      const newViewportY = cursorScreenY - graphY * newZoom;

      setViewport({ x: newViewportX, y: newViewportY, zoom: newZoom });
    }
  }, [getZoom, getViewport, setViewport]);

	useEffect(() => {
    const wrapper = flowRef.current;
    if (!wrapper) return;

    const handleWheelPassive = (event:any) => {
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        handleWheel(event);
      }
    };

    wrapper.addEventListener('wheel', handleWheelPassive, { passive: false });

    return () => {
      wrapper.removeEventListener('wheel', handleWheelPassive);
    };
  }, [handleWheel]);

	const onMoveStart = useCallback(() => {
		handleCloseMenu();
	}, []);

	return(
			<Card.Root
				ref={flowRef}
				h={'100%'}
				border={0}
				borderRadius={0}
				backgroundColor={'#fbfbfb'}
				alignItems={'center'}
				>
				<Box
					position={'absolute'}
					w={'100%'}
					zIndex={'1010'}
					h={'100%'}
				>
					<Card.Root
						w={'100%'}
						h={'100%'}
						border={'2px solid var(--chakra-colors-bg-muted)'}
						variant={'outline'}
						>
						<ReactFlow
							ref={gRef}
							onNodesChange  = {(e)=>onNodesChange(e)}
							onSelectionEnd = {onSelectionEnd}
							onPaneClick    = {onPaneClick}

							onKeyDown={handleKeyDown}
							snapGrid   = {[20, 20]}
							snapToGrid = {true}

							minZoom={0.01}
							maxZoom={15.5}
							panOnScroll
							selectionOnDrag
							panOnDrag={[1]}
							onMoveStart={onMoveStart}
							// @ts-expect-error chill
							onPaneContextMenu={onPaneContextMenu}
							onNodeContextMenu={onNodeContextMenu}
							// onPaneContextMenu={}

							panOnScrollSpeed  = {1.8}
							selectionMode     = {SelectionMode.Partial}
							zoomOnPinch={false}
							onWheel={(e:any)=>{
								handleWheel(e)
							}}
							
							nodes     = {ns}
							edges     = {es}
							nodeTypes = {nodeTypes}
							edgeTypes = {edgeTypes}
						>
							<ViewportDisplay/>
							{menu && <ContextMenu
								onClose={handleCloseMenu} {...menu}
								selectedIdsRef={selectedIdsRef}
							/>}
							{views.map((view: any) => (
								<GroupBoundary 
									key={view.$id}
									nodeIds={view.nodeIds}
									name={view.name}
								/>
							))}
						</ReactFlow>
					</Card.Root>
				</Box>
			</Card.Root>
	)
}
// export const SpFlow = React.memo(SpBodyFC)
export const SpFlow = SpBodyFC

const LoadingGraph=()=>{
	const {id} = useGraphCtx();
	return(
		<PanelGroup direction="horizontal">
			<span
				style={{
					width:'100%',
					height:'100%',
					display:'flex',
					flexDirection:'column',
					color: '#777',
					gap: '10px',
					alignItems:'center',
					justifyContent:'center'
				}}
				>
				<p>{`loading g.${id}`}</p>
				<Spinner/>
			</span>					
		</PanelGroup>
	)
}


const Body=()=>{
	const {
		id,
		mode,
		views,setViews,
		g,setG,
		setNs,setEs,
		viewId,
		isMobile,
		saveNs,setSaveNs,
	} = useGraphCtx();
	const noBrief = (g===undefined||g.name===undefined||g.description===undefined||g.nNodes===undefined);
	const noConfig = (g===undefined||views===undefined);

	useEffect(()=>{
		const fBrief=async ()=>{
			const fetchedG = await __render_brief(viewId,g)
			let user = undefined as any;
			// for somegraphs can be not specified
			if (fetchedG.owner){
				try{
					const response = await spaced_databases.listDocuments(
						space_db_id,
						user_collection_id,
						[
							Query.equal('$id', fetchedG.owner),
						],
					)
					user = response.documents[0];
				} catch(e:any){
					console.error('user not found',e.slice(0,10))
				}
			}
			fetchedG.owner=user;

			const histList = History.loc().split('.')
			if (histList.length==2){
				await store.dispatch({
					type: 'set_current_owner',
					payload: user,
				})
			}
			// g.owner=user;
			// setG(g);
			// <Box key={k+JSON.stringify(userData)} className='full'>
			// 	<UserCard
			// 		key={k+JSON.stringify(userData)}
			// 		userData={userData}
			// 	/>
			// 	<Separator/>
			// </Box>
			// <Spinner size="sm" />
			return JSON.parse(JSON.stringify(fetchedG))
		}
		const fConfig=async(graph:any)=>{
			const f=async(graph:any)=>{
				const doc = await __render_edit(viewId) as any;
				if (graph){
					graph.permissions=doc.$permissions
				}
				const viewsIds = doc.viewsIds
				const vs = await __fetch_views(viewsIds) as any;
				// vs=[...vs, {...graph, $id:viewId, nodeIds:doc.nodeIds}];
				// fetch all nodes'data:
				const datas = await __fetch_nodes(doc.nodeIds)
				const [newNs,edges] = await __recalc__graph(datas as any) as any;
				await setNs([...newNs]);
				if (saveNs.length == 0){
					console.log('??',newNs)
					await setSaveNs(newNs);
				}
				console.log('saveNs',saveNs)
				await setEs([...edges]);
				return [vs,graph]
			}
			return await f(graph);
		}

		switch (mode){
			case 'BRIEF': {
				if (noBrief){
					const f=async()=>{
						const g=await fBrief();
						setG(g)
					}
					f()
				}
				return
			}
			case 'EDIT':{
				const f=async()=>{
					if (noConfig){
						const fg=await fBrief();
						const[fvs,graph]=await fConfig(fg);
						const d={};
						fvs.map((view:any)=>{
							// @ts-expect-error chill
							d[view.$id]=view.nodeIds
						})
						graph.views=d

						spaced_client.subscribe(
							`databases.${
								space_db_id
							}.collections.${
								NAMESPACE_COLLECTION_ID
							}.documents.${viewId}`,
							async response => {
							console.log('update col:', response);
							await fBrief()
							await fConfig(fg)
						});
						await setG(graph)
						await setViews(fvs)
					}
				}
				f();
			}
		}
	},[g,viewId,mode])
	
	switch (mode) {
	case 'BRIEF':{
		if (noBrief){
			return <LoadingGraph/>
		}else{
			return (
				<SpGraphBriefCard
					id={id}
					isMobile={isMobile}
					name={g!.name}
					description={g!.description}
					nNodes={g!.nNodes}
					owner={g.owner}
				/>
			)
		}
	}
	case 'EDIT': {
		if (noBrief||noConfig){
			return <LoadingGraph/>
		}else{
			return (
				<ReactFlowProvider>
					<SpFlow/>
				</ReactFlowProvider>
			)
		}
	}
	case 'REPEAT': {
		return (<></>)
	}
	default: {
		return (<LoadingGraph/>)
	}}
}

export default Body;