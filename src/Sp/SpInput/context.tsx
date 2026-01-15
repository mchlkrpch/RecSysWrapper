import { createContext, useContext } from "react";

interface SpInputContextType {
	sparea_ref: any;
	getSpText: (ref:any,innerBlocks:any)=>string;
	searcher_ref: any;
	content: string;
	setContent: (s: string)=>void;
	display: boolean;
	setDisplay: (d: boolean)=>void;
	innerBlocks: object;
	setInnerBlocks: (n: object)=>void;
	offset: number;
	setOffset: (n: number)=>void;
	searcherVisible: boolean;
	setSearcherVisible: (b: boolean) => void;
	onBlur: any;
	selfRef:any,
	json:any,
}

export const SpInputContext = createContext<SpInputContextType|null>(null);

export const useSpInputContext = ()=>{
	const ctx = useContext(SpInputContext);
	if (!ctx) {
		throw new Error('use inside SpInput.Root');
	}
	return ctx;
}