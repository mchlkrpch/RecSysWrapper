import React, { forwardRef, useImperativeHandle, useState } from "react"
import {
	Box,
	Card,
	Skeleton,
	SkeletonText,
	Stack,
} from "@chakra-ui/react";
import Header from "./header";
// import ViewrFooter from "./footer";
import EditorBody from "./body";
import { ID } from "appwrite";

export const NEW_JSON_CARD={
	forward:['forward'],
	backward:['backward'],
	id: ID.unique(),
	tp: 'Def',
}

const EditorFC:React.ForwardRefRenderFunction<any>=(
	props:any,
	ref:any,
)=>{
	const {
		mode,
		cards,
		refs,
		show,
		// filters,
	}=props as any;

	const[currentCards,setCurrentCards]=useState(cards);

	const[currentRefs,setCurrentRefs]=useState(refs);
	// @ts-expect-error: TODO
	// eslint-disable-next-line
	const[currentShow,setCurrentShow]=useState(show);
	// @ts-expect-error: TODO
	// eslint-disable-next-line
	const[currentMode,setCurrentMode]=useState(mode);
	const [currentViewId,setCurrentViewId]=useState(undefined)as any;

	const showF=async(cs: any)=>{
		const arr_refs = cs.map((card: any)=>{
			return {
				'forward': card.forward.filter((cnt:string)=>cnt!=='').map(() =>React.createRef()),
				'backward': card.backward.filter((cnt:string)=>cnt!=='').map(() =>React.createRef()),
			}
		})
		const f = async ()=>{
			if (cs.length===0){
				await setCurrentCards(cs);
				await setCurrentRefs(arr_refs);
				await setCurrentShow(true);
			}else{
				await setCurrentRefs(arr_refs);
				await setCurrentCards(cs);
				await setCurrentShow(true);
			}
		}
		await f();
	}

	const append=async(
		cnt:string,
		cardId:number,section:string,blockId:number,
	)=>{
		const cs = currentCards;
		const card = cs[cardId]
		const new_cnt = [
			...card[section].slice(0, blockId),
			cnt,
			...card[section].slice(blockId),
		]
		card[section] = new_cnt;
		cs[cardId] = card;
		await showF(cs);
	}

	useImperativeHandle(ref, () => ({
		show: showF,
		append:append,
		getCards:()=>currentCards,
		getRefs:()=>currentRefs,
		getCurrentViewId:()=>currentViewId,
		setCurrentViewId:(id:any)=>setCurrentViewId(id),
	}));

	if (
		currentMode==='LOADING'
	) {
		return (
			<Card.Root
				p={'20px'}
				w={'240px'}
				h={'100vh'}
				position={'fixed'}
				variant={'outline'}
				rounded={'none'}
				>
				<Stack gap="6" maxW={'240px'}>
					<SkeletonText noOfLines={2} />
					<Skeleton height="100px" />
				</Stack>
			</Card.Root>
		)
	} else {
		return (
				<Card.Root
					p={0}
					borderRadius={0}
					w={'100%'}
					border={'none'}
					h={'100%'}
					className={'editor'}
					display={'flex'}
					flexDirection={'column'}
					backgroundColor={'transparent'}
					>
					{/* <Box w={'100%'} h={'fit-content'} flexShrink={0}>
						<ViewrFooter/>
					</Box> */}
					<Box
						w={'100%'}
						minH={0}
						h={'100%'}
						p={0}
						>
						<EditorBody
							cards={currentCards||[]}
							currentViewId={currentViewId}
							setCurrentViewId={setCurrentViewId}
						/>
					</Box>
					<Box w={'100%'} h={'fit-content'} flexShrink={0}>
						<Header/>
					</Box>
				</Card.Root>
		)
	}
};

const Editor =forwardRef(EditorFC);

export default Editor;