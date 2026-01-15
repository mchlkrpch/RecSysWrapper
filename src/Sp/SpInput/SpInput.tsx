import React, { type MemoExoticComponent } from "react";
import Root from "./root";
import Body from "./body";

type SpInputComponent = MemoExoticComponent<any> & {
	Root: MemoExoticComponent<any>;
	Searcher: React.FC<any>;
	Body:  MemoExoticComponent<any>;
}

const SpInput: SpInputComponent|any = Root;

SpInput.Body = Body;
SpInput.Root = SpInput;

export default SpInput;