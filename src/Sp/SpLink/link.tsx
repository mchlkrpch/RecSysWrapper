// @ts-expect-error: react for jsx elements warning
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
	type ForwardRefRenderFunction
} from "react";
import {
	ChakraProvider,
	Combobox,
	defaultSystem,
	Portal,
	useFilter,
	useListCollection
} from "@chakra-ui/react";

import { useGraphCtx } from "../SpGraph/context";
import { Tooltip } from "../ui/tooltip";
import { SpCard } from "../SpGraph/components/card";


/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SpContent } from "../SpInput/body";
import { useSpInputContext } from "../SpInput/context";

const tooltipBriefcardStyle=css`
	background-color:transparent,
	box-shadow:none,
	background-color:blue;
`;

const linkFrame=css`
	padding:0;
	padding-top:-4px;
	border:none;
	height: fit-content;
	borderRadius:0;
	background-color: #d9eafd;
	color: #2436a5;
`;

export const transformLabel = (label: string): string => {
	const regex = /<id=(.*?)>/g;
	return label.replace(regex, '');
};

const initWidth = 20;

const SpLinkFc:ForwardRefRenderFunction<any,any>=(props:any,ref:any)=>{
	const {
		data,
	}=props;

	const {
		id
	} = data;

	const {
		// ns,
		editor,saveNs,
	} = useGraphCtx() as any;

	const inputCtx=useSpInputContext() as any;

	const [hidden,setHidden]=useState(true);
	const [w,setW]=useState(initWidth);

	// 1. try to find in graph
	const [n] = saveNs.filter((n:any)=>n.id===id)
	let label = '';
	if(n) {
		label=transformLabel(n.data.forward[0])
	} else {
		// 2.try to find in new created nodes in editor
		if (editor.current!==null){
			const cs = editor.current.getCards()
			if (cs){
				const [n] = cs.filter((n:any)=>n.id===id)
				if (n) {
					label=transformLabel(n.forward[0])
				}
			}
		}
	}
	const [curLabel,setCurLabel]=useState(label);

	// create colleciton for link
	const canvasRef = useRef<HTMLCanvasElement>(null) as any;
	const inputRef = useRef<HTMLInputElement>(null) as any;

	const { contains } = useFilter({ sensitivity: "base" })
	const items = saveNs.map((n: any)=>({
		label: transformLabel(n.data.forward[0]), value: n.data.forward[0], nodeId:n.id,
	}))
	const { collection,filter} = useListCollection({
		initialItems: items,
		filter: contains,
	})

	const measureTextWidth = (t: string) => {
		const el = canvasRef.current as any
		el.innerText = t
		const width = el.clientWidth
		return width;
	};

	const focus=async(end:boolean)=>{
		await setHidden(false);
		if (end) {
			inputRef.current.focus()
		} else {
			inputRef.current.focus()
			inputRef.current.setSelectionRange(0, 0);
		}
	}

	useImperativeHandle(ref, () => ({
		focus: focus,
	}));

	const handleInputChange = (e: any) => {
		filter(e.inputValue);
		const t = inputRef.current.value;
		inputRef.current.value=t
		setW(measureTextWidth(t));
	};

	return (
		// eslint-disable-next-line
		<span
			className="inline_node"
			// @ts-expect-error: new emotion's attribute
			css={linkFrame}
			onClick={()=>{
				setHidden(false)
				ref.current.focus(false);
			}}
			>
			{hidden===true? (
				<ChakraProvider value={defaultSystem}>
					<Tooltip
						// @ts-expect-error: emotion's css new property for all els
						css={tooltipBriefcardStyle}
						positioning={{ placement: "right-end" }}
						interactive
						content={<SpCard id={id}/>}
						>
						<SpContent
							content={curLabel} isInner={true}/>
					</Tooltip>
				</ChakraProvider>
			):(
				<ChakraProvider value={defaultSystem}>
					<span ref={canvasRef} className='canvas'/>
					<Combobox.Root
						variant={'flushed'}
						collection={collection}
						onInputValueChange={handleInputChange}
						onValueChange={(e: any)=>{
							const t = transformLabel(e.value[0]);
							inputRef.current.value = t
							setW(measureTextWidth(t))
						}}
						fontSize={'13px'}
						fontFamily={'Roboto Mono'}
						w={'fit-content'}
						h={'fit-content'}
						p={0}
						>
						<Combobox.Control
							p={0}
							w={'fit-content'}
							>
							<Combobox.Input
								ref={inputRef}
								fontSize={'13px'}
								fontFamily={'Roboto Mono'}
								p={0}
								outline={0}
								border={0}
								w={`${w}px`}
								minW="20px"
								minH={'20px'}
								h={'20px'}
								placeholder="Type to search"
								defaultValue={transformLabel(curLabel)}
								onBlur={async()=>{
									const [it] = collection.items.filter((it:any)=>it.label ===inputRef.current.value) as any;
									// change label
									setHidden(true);
									setCurLabel(inputRef.current.value)
									// set dataset-id attribute to inline_node root
									const inline_block=inputRef.current.parentElement.closest('.inline_node').parentElement;
									inline_block.dataset.id=it.nodeId

									setTimeout(() => {
										const activeElement = document.activeElement;
										const allSpTextareas = document.querySelectorAll('.SpTextarea');
										let isInsideSpTextarea = false;
										
										// Проверяем все SpTextarea на странице
										allSpTextareas.forEach(textarea => {
											if (textarea.contains(activeElement)) {
												isInsideSpTextarea = true;
											}
										});
										
										if (!isInsideSpTextarea) {
											inputCtx.selfRef.current.onBlur()
										}
									}, 10);
								}}
								onChange={(e: any)=>handleInputChange(e)}
							/>
						</Combobox.Control>

						{/* options with render of math */}
						<Portal>
							<Combobox.Positioner>
								<Combobox.Content zIndex={'1020'} minW={'320px'}>
									<Combobox.Empty>No items found</Combobox.Empty>
									{collection.items.map((item: any)=>(
										<Combobox.Item
											item={item}
											key={item.value}
											>
											<SpContent content={item.label} isInner={true}/>
											<Combobox.ItemIndicator />
										</Combobox.Item>
									))}
								</Combobox.Content>
							</Combobox.Positioner>
						</Portal>
					</Combobox.Root>
				</ChakraProvider>
			)}
		</span>
	);
}

const SpLink =forwardRef(SpLinkFc);
export default SpLink;