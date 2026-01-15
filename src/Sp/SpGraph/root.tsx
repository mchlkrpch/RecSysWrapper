import React, { useRef, useState } from "react";
import { SpEditorCtx, type EditorModeTp, type SpSubgraphView } from "./context";

const initialNodes = [] as any;

const RootGraph: React.FC = ({ id, defaultMode,isMobile, editorRef,children }: any) => {
	const [viewId,setViewId] = useState(id);
	const [mode,setMode] = useState(defaultMode as EditorModeTp);
	const [g,setG] = useState(undefined as SpSubgraphView);
	const [saveG,setSaveG] = useState(undefined as SpSubgraphView);
	const [views,setViews]=useState(undefined) as any;
	const [ns,setNs] = useState(initialNodes)
	const [saveNs,setSaveNs]=useState(ns);
	const [es,setEs] = useState([])
	const [progress,setProgress] = useState({})
	const [selectedNs,setSelectedNs] = useState([])
	const [editViewMode,setEditViewMode]=useState('content')as any;
	const [nodesToSave,setNodesToSave]=useState(new Set<string>());

	const feedRef=useRef(null)as any;

	return(
		<>
			{/* @ts-expect-error chill */}
			<SpEditorCtx.Provider value={{
				id,
				editViewMode:editViewMode,setEditViewMode:setEditViewMode,
				progress:progress,setProgress:setProgress,
				viewId:viewId,setViewId:setViewId,
				mode:mode,setMode:setMode,
				views:views,setViews:setViews,
				g:g,setG:setG,
				saveG,setSaveG,
				ns:ns,setNs:setNs,
				saveNs,setSaveNs,
				es:es,setEs:setEs,
				selectedNs:selectedNs,setSelectedNs:setSelectedNs,
				editor:editorRef,setEditor:()=>editorRef,
				isMobile:isMobile,
				nodesToSave:nodesToSave,setNodesToSave:setNodesToSave,
				feedRef:feedRef,
			}}>
				{children}
			</SpEditorCtx.Provider>
		</>
	)
}

const Root = React.memo(RootGraph);

export default Root;