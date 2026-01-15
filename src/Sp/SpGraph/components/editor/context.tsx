import { createContext, useContext } from "react";

interface SpEditorContextType {
	currentFilters:any,setCurrentFilters:(v:any)=>any,
	searching:any,setSearching:(v:any)=>any,
	currentTab:any,setCurrentTab:(v:any)=>any,
	searcherInputRef:any,
	content:any,setContent:(v:any)=>any,
};

export const SpEditorComponentCtx = createContext<SpEditorContextType|null>(null);

export const useSpEditorComponentCtx = ()=>{
	const ctx = useContext(SpEditorComponentCtx);
	if (!ctx) {
		throw new Error('use inside SpInput.Root');
	}
	return ctx;
}