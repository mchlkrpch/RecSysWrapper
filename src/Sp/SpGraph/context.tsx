import { createContext, useContext } from "react";

export type EditorModeTp = (
	undefined			// not rendered|empty
	|'BRIEF'			// brief about graph
	|'EDIT'				// edit graph state
	|'REPEAT'     // for subgraph
	|'LOADING'		// for indicating pause
);

export type SpId = string;

export type DataTp={
	forward:string[],
	backward:string[],
	id:SpId,
	tp:string,
}

export type UpdateProgressTp={id:SpId,result:any};

export type ProgressTp={
	[key:SpId]: {
		data: object,
		float: number,
	}
}

export type RankerTp={
	// return next batch to display and repeat
	getNextBatch:(datas:DataTp[],progress:ProgressTp)=>string[],
	updateProgress:(changes:UpdateProgressTp[])=>void;
	progress:ProgressTp,
}

export type SpSubgraphView = {
	parentId: string|undefined;
	name: string|undefined;
	description: string|undefined;
	nNodes: number;
	// Context nodes
	namespace: Set<string>;
	// nodes in considered subgraph
	ns: Node[]|undefined; setNs: (ns: any[])=>void;
	// walkthrough, repeat, practice progress
	progress: object; setProgress: (p: any)=>void;
	permissions: object; setPermissions: (p:any)=>void;
	owner:any;
	editors:any[];
	blackList:any[];
}|undefined;

interface SpEditorI {
	id: string;
	// current editor mode to display
	mode: EditorModeTp; setMode: (m: EditorModeTp)=>void;
	
	// user views (including canonical partitioning)
	views: any; setViews: (vs: any)=>void;

	// current subgraph to view content
	g: SpSubgraphView; setG: (g: SpSubgraphView)=>void;
	saveG:SpSubgraphView,setSaveG:(g: SpSubgraphView)=>void;
	ns:any;setNs:any;
	saveNs:any,setSaveNs:any;
	es:any;setEs:any;
	
	selectedNs:any;setSelectedNs:any;
	progress:any;setProgress:any;
	editViewMode:any;setEditViewMode:any;
	
	// editor panel instance
	editor:any;setEditor:any;
	// id of current considered view
	viewId:string;setViewId:(id:string)=>void;
	ranker:any,
	isMobile:boolean;
	nodesToSave:Set<string>;setNodesToSave:(n:any)=>void;
	feedRef:any;
}

export const SpEditorCtx = createContext<SpEditorI|null>(null);

export const useGraphCtx = ()=>{
	const ctx = useContext(SpEditorCtx);
	if (!ctx) {
		throw new Error('use graph context');
	}
	return ctx;
}