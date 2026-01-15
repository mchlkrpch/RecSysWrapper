import { type MemoExoticComponent } from "react";
import Root from "./root";
import Body from "./body";
// import SpInput from "../SpInput/SpInput";
import Editor from "./components/editor/root";

type SpInputComponent = MemoExoticComponent<any> & {
	id: string;
	Root: MemoExoticComponent<any>;
	Body: MemoExoticComponent<any>;
	Repeat: MemoExoticComponent<any>;
	Editor: MemoExoticComponent<any>;
}

const SpGraph: SpInputComponent|any = Root;

SpGraph.Root = SpGraph;
SpGraph.Body = Body;
// SpGraph.SpInput = SpInput;
SpGraph.Editor=Editor;
// SpGraph.Repeat = Repeat;

export default SpGraph;