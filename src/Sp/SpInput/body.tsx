import React, { useEffect } from "react";
import {
	__key_down_callback,
	__parse_content,
	remarkCustomComponents
} from "./utils";
import { Card } from "@chakra-ui/react";
import { SpInputContext, useSpInputContext } from "./context";

import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { createRoot } from "react-dom/client";
import {
	SpEditorCtx,
	useGraphCtx
} from "../SpGraph/context";
import SpLink from "../SpLink/link";
import { ID } from "appwrite";
import { NEW_BLOCK_SPLITTER, NEW_SIDE_SPLITTER } from "../../utils/utils";

const headingStyles: React.CSSProperties = {
  marginTop: '1.2em',
  marginBottom: '0.4em',
  fontWeight: 600,
};

// Базовый набор кастомных рендеров для стандартных MD элементов
const baseComponents: Components = {
  // Заголовки h1, h2, ... h6
  // ReactMarkdown передает в `level` число от 1 до 6.
	// eslint-disable-next-line
  h1: ({ node, ...props }:any) => <h1 style={{ ...headingStyles, fontSize: '2em', borderBottom: '1px solid #ddd' }} {...props} />,
  // eslint-disable-next-line
	h2: ({ node, ...props }) => <h2 style={{ ...headingStyles, fontSize: '1.5em', borderBottom: '1px solid #eee' }} {...props} />,
  // eslint-disable-next-line
	h3: ({ node, ...props }) => <h3 style={{ ...headingStyles, fontSize: '1.25em' }} {...props} />,
  // eslint-disable-next-line
	h4: ({ node, ...props }) => <h4 style={{ ...headingStyles, fontSize: '1em' }} {...props} />,
  // eslint-disable-next-line
	h5: ({ node, ...props }) => <h5 style={{ ...headingStyles, fontSize: '0.875em', color: '#555' }} {...props} />,
  // eslint-disable-next-line
	h6: ({ node, ...props }) => <h6 style={{ ...headingStyles, fontSize: '0.85em', color: '#666' }} {...props} />,
  
  // Списки
	// eslint-disable-next-line
  ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }} {...props} />,
  // eslint-disable-next-line
	ol: ({ node, ...props }) => <ol style={{ paddingLeft: '0px' }} {...props} />,
  
  // Элементы списка. Можно добавить кастомные маркеры или логику.
	// eslint-disable-next-line
  li: ({ node, ...props }) => <li style={{ marginBottom: '0.4em' }} {...props} />,
  
  // Пример для других элементов, если понадобится
  // blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid #ccc', paddingLeft: '1em', color: '#777'}} {...props} />,
  // code: ({node, inline, ...props}) => {
  //   return inline ? <code style={{backgroundColor: '#f1f1f1', padding: '2px 4px', borderRadius: '4px'}} {...props} /> : <pre><code {...props} /></pre>
  // }
};

/**
 * A component for displaying content in "view mode".
 * It renders Markdown text with support for LaTeX and custom `<splink>` inline blocks.
 * Essentially, this is a "noun-like" block that provides a static representation
 * of complex content.
 *
 * @param content - .md code to display
 * @param isInner - to ignore links if this field is not part
 * of the graph(f.e. description of course is not inner content)
 * @returns {React.ReactElement}
 */
export const SpContent=({content,isInner}: any)=>{
	// set not inner by default
	// if (isInner===undefined)
	// 	isInner=true;

	// let components = {} as Components;
	// if (isInner){
	// 	components = {
	// 		'splink': ()=><></>
	// 	}as Components;
	// } else {
	// 	// if it's inside graph
	// 	components={
	// 		'splink': ({id}: any) =>{
	// 			return (
	// 				<SpLink
	// 					ref={React.createRef()}
	// 					data={{id:id}}
	// 				/>
	// 			)
	// 		},
	// 		'p': (props) => <span {...props} />,
	// 	} as Components;
	// }
	const isInnerContent = isInner === undefined ? true : isInner;

  const finalComponents: Components = { ...baseComponents }; // Начинаем с базового набора

  if (isInnerContent) {
    // В "внутреннем" режиме splink не рендерится
		// @ts-expect-error this file doesn't know about rehype function
    finalComponents.splink = () => <></>;
  } else {
    // В режиме "графа" splink рендерится как SpLink,
    // а параграфы <p> заменяются на <span> для компактности
    // @ts-expect-error this file doesn't know about rehype function
		finalComponents.splink = ({ id }: any) => (
      <SpLink
        ref={React.createRef()} // ref обычно используется иначе, но оставим как в вашем примере
        data={{ id: id }}
      />
    );
    finalComponents.p = (props) => <span {...props} />;
  }

	return (
		<ReactMarkdown
			remarkPlugins={[remarkCustomComponents]}
			rehypePlugins={[
				rehypeRaw,
				rehypeKatex,
			]}
			components={finalComponents}
		>
			{content}
		</ReactMarkdown>
	)
}

/**
 * A controller component that switches between view mode (`SpContent`)
 * and edit mode (`ActiveBody`).
 *
 * @returns {React.ReactElement}
 */
const BodyFc: React.FC<any>=()=>{
	const {
		display,setDisplay,
		sparea_ref,getSpText,
		searcher_ref,
		content,setContent,
		innerBlocks,setInnerBlocks,
		offset,setOffset,
		searcherVisible,setSearcherVisible,
	}=useSpInputContext() as any;

	const refs = {
		textarea: React.createRef(),
		canvas: React.createRef(),
		input: React.createRef(),
	} as any

	return (
		display? (
			<button
				onClick={async ()=>setDisplay(false)}
				style={{
					textAlign:'-webkit-match-parent',
				}}
				>
				<SpContent content={content} isInner={false}/>
			</button>
		):(
			<ActiveBody
				refs={refs}
				sparea_ref={sparea_ref}
				getSpText={getSpText}
				searcher_ref={searcher_ref}
				content={content}
				setContent={setContent}
				setDisplay={setDisplay}
				innerBlocks={innerBlocks}
				setInnerBlocks={setInnerBlocks}
				offset={offset}
				setOffset={setOffset}
				searcherVisible={searcherVisible}
				setSearcherVisible={setSearcherVisible}
			/>
		)
	)
}
const Body = React.memo(BodyFc);


const ActiveBodyFC: React.FC<any>=(props: any) => {
	const {
		refs,
		sparea_ref, getSpText,
		searcher_ref,
		content, setContent,
		setDisplay,
		innerBlocks, setInnerBlocks,
		offset,setOffset,
		searcherVisible, setSearcherVisible,
	} = props as any;

	useEffect(()=>{
		sparea_ref.current.focus()
	},[sparea_ref])

	const {
		editor,
	}=useGraphCtx();

	const {
		json,
	}=useSpInputContext() as any;
	
	const _update = async () => {
		let newContent = ''
		if (searcher_ref.current) {
			const s = searcher_ref.current.value as any;
			newContent = JSON.parse(JSON.stringify(content))
			newContent = (
				// head
				newContent.slice(0,offset)+
				// <id=...|content>
				'<id='+'123'+'|'+s+'>'+
				// tail
				newContent.slice(offset)
			)
		} else {
			const html = sparea_ref.current.innerHTML;
			const text = html
			newContent = getSpText(sparea_ref,text)
			Object.keys(innerBlocks).map((key:string)=>{
				delete innerBlocks[key];
			})
		}
		// eslint-disable-next-line
		const regex = /\[([^|\/]+)[|\/]([^\]]+)\]\s*\n([\s\S]*?)\n={3,}\n([\s\S]*?)(?=\s*\[[^|\/]+[|\/][^\]]+\]|$)/g
		let match;
		const results = [];
		while ((match = regex.exec(newContent)) !== null) {
			const tp = match[1]
			const id = match[2];
			const forwardContent = match[3].split('\n---\n');
			const backwardContent = match[4].split('\n---\n');
			results.push({
				tp:tp,
				id: id,
				forward: forwardContent,
				backward: backwardContent,
			});
		}
		await setInnerBlocks(innerBlocks)
		editor.current.show(results)
		await setContent(newContent)
		await setDisplay(true)
	}

	const graphCtx = useGraphCtx() as any;
	const inputCtx = useSpInputContext() as any;

	const onKeyDown = (e: any) => __key_down_callback(
		e,{
		ref: refs,
		content,setContent,
		innerBlocks: innerBlocks, setInnerBlocks: setInnerBlocks,
		getSpText: getSpText,
		searcher_ref:searcher_ref,
		offset: offset, setOffset:setOffset,
		searcherVisible: searcherVisible, setSearcherVisible:setSearcherVisible,
		graphCtx:graphCtx,
		inputCtx:inputCtx,
	})

	useEffect(() => {
		const editor = sparea_ref.current;
		if (!editor)
			return;

		if (json!==undefined) {
			//
			editor.innerHTML = `[${json.tp}|${json.id}]\n`;
			json.forward.map((b:any)=>{
				const parsedNodes = __parse_content(b);
				parsedNodes.forEach((node: any,i:number) => {
					if (node.type === 'text') {
						editor.appendChild(document.createTextNode(node.value));
						if (i != parsedNodes.length-1) {
							editor.appendChild(document.createTextNode(NEW_BLOCK_SPLITTER));
						}
					} else if (node.type === 'splink') {
						const el = document.createElement('div');
						el.className = 'inline_node';
						el.contentEditable = 'false'
						
						const blockId = ID.unique()
						el.id=blockId
						el.dataset.id = node.id;
	
						const blockRef = React.createRef() as any;
						innerBlocks[blockId] = {
							ref:blockRef,
							data:{id: el.dataset.id},
							blockId:blockId,
						}
						editor.appendChild(el);
						const root = createRoot(el);
						root.render(
							<SpEditorCtx.Provider value={graphCtx}>
								<SpInputContext.Provider value={inputCtx}>
									<SpLink
										data={innerBlocks[blockId].data}
										ref={innerBlocks[blockId].ref}
										blockId={blockId}
									/>
								</SpInputContext.Provider>
							</SpEditorCtx.Provider>
						);
					}
				})
			})
			editor.innerHTML += NEW_SIDE_SPLITTER;
			json.backward.map((b:any,i:number)=>{
				const parsedNodes = __parse_content(b);
				parsedNodes.map((node:any) => {
					if (node.type === 'text') {
						editor.appendChild(document.createTextNode(node.value));
						if (i !== json.backward.length-1) {
							editor.appendChild(document.createTextNode(NEW_BLOCK_SPLITTER));
						}
					} else if (node.type === 'splink') {
						const el = document.createElement('div');
						el.className = 'inline_node';
						el.contentEditable = 'false'
						
						const blockId = ID.unique()
						el.id=blockId
						el.dataset.id = node.id;
	
						const blockRef = React.createRef() as any;
						innerBlocks[blockId] = {
							ref:blockRef,
							data:{id: el.dataset.id},
							blockId:blockId,
						}
						editor.appendChild(el);
						const root = createRoot(el);
						root.render(
							<SpEditorCtx.Provider value={graphCtx}>
								<SpInputContext.Provider value={inputCtx}>
									<SpLink
										data={innerBlocks[blockId].data}
										ref={innerBlocks[blockId].ref}
										blockId={blockId}
									/>
								</SpInputContext.Provider>
							</SpEditorCtx.Provider>
						);
					}
				})
			});
		}else{
			editor.innerHTML=content;
		}
	}, [json,content,graphCtx,innerBlocks,setInnerBlocks,sparea_ref,inputCtx]);

	return(
		<>
			<Card.Root
				fontSize={'16px'}
				// fontFamily={'Roboto Mono'}
				outline={0}
				border={0}
				w={'100%'}
				backgroundColor={'transparent'}
				>
				<div
					role='textbox'
					tabIndex={0}
					className="SpTextarea"
					contentEditable
					ref={sparea_ref}
					suppressContentEditableWarning={true}
					onKeyDown={onKeyDown}
					onBlur={(e)=>{
						const currentElement = e.currentTarget as any;
						const relatedElement = e.relatedTarget as any;
						// check if we blur not in inner_div block but outside entire SpTexarea
						if (relatedElement && currentElement.contains(relatedElement)) return
						_update()
						if (inputCtx.onBlur!==undefined){
							inputCtx.onBlur()
						}
					}}
				/>
				<canvas className="hidden" ref={refs.canvas} />
			</Card.Root>
		</>
	)
}

const ActiveBody=React.memo(ActiveBodyFC)

export default Body;