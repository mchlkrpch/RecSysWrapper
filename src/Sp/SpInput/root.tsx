// @ts-expect-error: React for jsx elements no warning
import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { SpInputContext } from "./context";

function RootFC(props:any,ref:any){
	const {
		defaultValue,
		input_ref,
		children,
		onBlur,
		json,
		initDisplay,
	}=props as any;
	const [content, setContent] = useState(defaultValue || 'dsgsd');
	const searcher_ref = useRef(null);

	const [offset, setOffset] = useState(0);
	const [innerBlocks, setInnerBlocks] = useState({}) as any;
	const [display, setDisplay] = useState(initDisplay!==undefined?initDisplay:true);
	const [searcherVisible, setSearcherVisible] = useState(false);

	const getTextFromElement=(element: HTMLElement): string => {
		let text = '';
		element.childNodes.forEach((child: Node) => {
			if (child.nodeType === Node.TEXT_NODE) {
				text += '\n'+child.textContent || '';
			} 
			// Особый случай для inline_node внутри других элементов
			else if (child instanceof HTMLElement && child.classList.contains('inline_node')) {
				const linkToId = child.dataset.id;
				text += `<id=${linkToId}>`;
			}
			// Рекурсивно обрабатываем вложенные элементы
			else if (child instanceof HTMLElement) {
				text += getTextFromElement(child);
			}
		});
		
		return text;
	};

	// @ts-expect-error unused variables
	// eslint-disable-next-line
	const getSpText = (r:any,t:any) => {
		if (!(input_ref as any)?.current)
			return '';

		let newContent = '';
		const childNodes = Array.from((input_ref as any).current.childNodes);
		childNodes.forEach((n: any) => {
			if (n.className === 'inline_node') {
				const linkToId = n.dataset.id;
				newContent += '<id='+linkToId+'>';
			} else if (n.nodeType === Node.TEXT_NODE) {
				newContent += n.data;
			}else{
				newContent += getTextFromElement(n)
			}
		});
		return newContent;
	};

	useImperativeHandle(ref, () => ({
		getSpText: getSpText,
		setContent:(s:string)=>setContent(s),
		onBlur:()=>{
			setDisplay(true);
			setContent(getSpText(ref,ref.current.value))
			onBlur()
		},
	}));

	return (
		<>
			<SpInputContext.Provider value={{
				sparea_ref: input_ref,
				getSpText,
				searcher_ref,
				content: content,
				setContent: setContent,
				display: display,
				setDisplay: setDisplay,
				innerBlocks: innerBlocks, setInnerBlocks: setInnerBlocks,
				offset: offset, setOffset: setOffset,
				searcherVisible: searcherVisible, setSearcherVisible: setSearcherVisible,
				onBlur: onBlur,
				selfRef: ref,
				json:json,
			}}>
				{children}
			</SpInputContext.Provider>
		</>
	);
}

const Root = forwardRef(RootFC);

export default Root;