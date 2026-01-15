// SpInput auxilary code
import { ID } from "appwrite";
import React from "react";

import SpLink from "../SpLink/link";
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Text, Root } from 'mdast';
import { createRoot } from "react-dom/client";
import { SpEditorCtx } from "../SpGraph/context";
import { SpInputContext } from "./context";

const __insert_inline_block = async (
	props: any,
) => {
	const {
		blockId,graphCtx,inputCtx,
	}=props;
	const{innerBlocks}=inputCtx;
	const selection = window.getSelection()!;
	const range = selection.getRangeAt(0);
	// delete selected text
	range.deleteContents();
	
	// const offs=range.endOffset
	// const cnt = range.startContainer.parentElement?.closest('.SpTextarea');
	// re-select area and collapse selection to end point
	// range.setStart(range.endContainer, offs);
	// range.collapse(true);	
	
	
	// old>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	// const editor = range.endContainer?.parentElement?.firstElementChild?.closest('.SpTextarea') as any;
	// const SpTextarea = range.startContainer
	// const SpTextarea = graphCtx.SpTextarea

	const el = document.createElement('div');
	el.className = 'inline_node';
	el.contentEditable = 'false';
	el.dataset.id='';
	el.id = blockId;

	// el.dataset.id = blockId;
	// el.dataset.value = '';
	await range.insertNode(el);
	const root = createRoot(el);
	await root.render(
		<SpEditorCtx.Provider value={graphCtx}>
			<SpInputContext.Provider value={inputCtx}>
				<SpLink
					data={innerBlocks[blockId].data}
					ref={innerBlocks[blockId].ref}
					blockId={blockId}
				/>
			</SpInputContext.Provider>
		</SpEditorCtx.Provider>
	)
	if (innerBlocks[blockId].ref.current){
		innerBlocks[blockId].ref.current.focus(true)
	}
	return innerBlocks;

	// const newRange = document.createRange();
	// let node_to_delete = undefined
	// // Check if there's a next sibling to place the cursor after
	// if (el.nextSibling) {
	// 	if (el.nextSibling.nodeType === Node.TEXT_NODE) {
	// 		newRange.setStart(el.nextSibling, 0);
	// 	} else {
	// 		newRange.setStartBefore(el.nextSibling);
	// 	}
	// 	if (el.nextSibling?.textContent?.trim() == '') {
	// 		el.nextSibling.remove()
	// 	}
	// } else {
	// 	node_to_delete = document.createTextNode('\u200B');
	// 	el.parentNode!.insertBefore(node_to_delete, el.nextSibling);
	// 	newRange.setStart(node_to_delete, 0);
	// 	node_to_delete.remove()
	// }
};


function __find_current_block(
	// parent element
	p: HTMLElement,
	// selected range
	range: any
) {
	let i = 0;
	const inner_div = undefined
	const prev_n = undefined
	const cur_n = undefined
	const next_n = undefined

	for (const node of p.childNodes) {
		let inner_input=undefined
		try{
			inner_input = node.firstChild?.childNodes[1].firstChild
		} catch(e) {
			console.error(`error: ${e}`)
		}
		if (range.startContainer == node) {
			return [false, [p.childNodes[i-1], node, p.childNodes[i+1]]]
		} else if (
			range.startContainer == inner_input
		) {
			return [true, [p.childNodes[i-1], inner_input, p.childNodes[i+1]]]
		}
		i += 1;
	}
	return [inner_div, [prev_n, cur_n, next_n]]
}



export const __key_down_callback = async (
	e: any,
	props: any,
) => {
	const selection = window.getSelection();
	const range = selection!.getRangeAt(0);
	const {innerBlocks,setInnerBlocks} = props
	switch (e.key) {
		// for searching elements on board & other boards
		case '/': {
			e.preventDefault();
			e.stopPropagation();
			
			// insert new block in input state
			const blockId = ID.unique()
			const blockRef = React.createRef() as any;
			innerBlocks[blockId] = {
				ref:blockRef,
				data:{id:''},
				blockId:blockId,
			}
			await setInnerBlocks(innerBlocks)
			// render block
			__insert_inline_block({
				blockId:blockId,
				graphCtx:props.graphCtx,
				inputCtx:props.inputCtx
			});
			return
		}

		case 'ArrowRight': {
			if (!selection || selection.rangeCount === 0) return;
			if (range.collapsed) {
				const tgt = e.target as any;
				const p = tgt.closest('.SpTextarea');
				if (
					// we are in the end of text (wheather textnode or inline block)
					tgt.value
				) {
					if (tgt.selectionStart == tgt.value.length) {
						const [,[,cur_n, next_n]] = __find_current_block(p,range) as any;
						// set cursor to next text node beginning
						if (next_n===undefined||cur_n.nodeName === 'DIV') {
							const range = document.createRange();
							p.focus();
							if (next_n === undefined){
								// (...[...^])
								range.selectNodeContents(p);
								range.collapse(false);
							} else if (next_n.nodeName == '#text') {
								// (...[...^]<text>)
								range.selectNodeContents(next_n);
								range.collapse(true)
							}
							selection.removeAllRanges();
							selection.addRange(range);
						}
						e.preventDefault();
					}
				} else {
					// end of textnode, select next inline node
					// (...^[...])
					if (range.endOffset ==  (range.endContainer as any).data.length) {
						const [,[, , next_n]] = __find_current_block(p,range) as any;
						// enter inside next inline block
						if (next_n?.nodeName === 'DIV' && next_n.contentEditable === 'false') {
							const id = next_n?.id
							const innerBlock = innerBlocks[id].e
							innerBlock.focus(false)
							e.preventDefault();
						}
					}
				}
			}
			return
		}

		case 'ArrowLeft': {
			if (!selection || selection.rangeCount === 0) return;
			const tgt = e.target as any;
			const p = tgt.closest('.SpTextarea');

			if (
				range.collapsed &&
				range.startOffset === 0 &&
				tgt
			) {
				const [inner_tag,[prev_n,,]] = __find_current_block(p, range) as any;
				if (!inner_tag) {
					if (prev_n.contentEditable === 'false') {
						// ([...]^...)
						const id = prev_n.id
						const blockRef = innerBlocks[id].ref
						blockRef.current.focus(true)
					}
					e.preventDefault()
				} else {
					if (tgt.selectionStart == 0) {
						// set cursor to the end of previous text node
						// (...[^...])
						p.focus()
						const range = document.createRange();
						range.selectNodeContents(prev_n);
						range.collapse(false)
						selection.removeAllRanges();
						selection.addRange(range);
						e.preventDefault()
					}
				}
			}
			return;
		}

		default: {
			return;
		}
	}
};


// const blockRegex = /\<id=(.*?)\|(.*?)\>/g;
const blockRegex = /<id=(.*?)>/g;
const customMathRegex = /\$\$(.*?)\$\$/g;


const __split_pattern = (
	s: string,
	p: any,
	add_common: any,
	add_selected: any,
)=>{
	let pI = 0;
  let m: any;
	const ans = [] as any
	while ((m = p.exec(s)) !== null) {
		const group = m[0]; const fst = m[1]; const scd = m[2]; const sI = m.index;
		const eI = sI + group.length;
		if (sI > pI)
			add_common(ans,s,pI,sI)
		if (scd !== undefined) {
			add_selected(ans,[fst,scd])
		} else {
			add_selected(ans,fst)
		}
		pI = eI;
	}
	if (pI < s.length)
		add_common(ans,s,pI,s.length)
	
	return ans
}

export const remarkCustomComponents: Plugin<[], Root> = () => {
  return (tree: any) => {
		// custom visitor for detecting math and custom inner blocks
    visit(tree, ['text', 'html'], (node: Text, index: any, p: any) => {
      if (!p || index === null )
				return

			const newChildren = __split_pattern(
				node.value,
				blockRegex,
				// split original string (s) and insert as textnode
				(ans: any, s:string, pI:number, sI:number)=>{
					ans.push({type:'text', value:s.slice(pI, sI)})
				},
				// insert data as splink content
				(ans:any, data:string)=>{
					ans.push({
						type:'html', value:`<splink id="${data}" value="${data}"></splink>`
					})
				},
			)

			const finalNodes = newChildren.flatMap((n: any) => {
        if (n.type === 'html')
          return [n]

        const nodesWithMath = __split_pattern(
          n.value,
          customMathRegex,
          (ans: any, s: string, pI: number, sI: number) => {
            ans.push({type: 'text', value: s.slice(pI, sI)});
          },
          (ans: any, data: string) => {
            ans.push({
							data: {
								hChildren: [{type: 'text', value: data}],
								hName: 'code',
								hProperties: {
									className: ['lambuage-math', 'math-inline']
								}
							},
							position: {},
							type: 'inlineMath',
							value: data
						});
          },
        );
        return nodesWithMath;
      });

      p.children.splice(index, 1, ...finalNodes);      
      // Возвращаем `index + finalNodes.length`
			// чтобы visit продолжил обход со следующего нового узла
      return index + finalNodes.length;
    });
  };
};

export function __parse_content(content: string): any {
  const result = [];
  const regex = /<id=(.*?)>/g;
  let lI = 0;
  let m;

  while ((m = regex.exec(content)) !== null) {
    if (m.index > lI)
      result.push({type:'text', value:content.substring(lI, m.index)});

    result.push({type:'splink', id:m[1]});
    lI = m.index + m[0].length;
  }

  if (lI < content.length)
    result.push({ type: 'text', value: content.substring(lI) });

  return result;
}