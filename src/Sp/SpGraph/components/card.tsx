// link card on hover
import React, { useCallback } from 'react';
import { SpEditorCtx, useGraphCtx } from '../context';
import { Card } from '@chakra-ui/react';
import { useReactFlow } from '@xyflow/react';
import { SpContent } from '../../SpInput/body';

const CardFC:React.FC=(props:any) => {
	const {
		ns
	}=useGraphCtx() as any;
	const id = props.id;
	const n= ns.filter((n:any)=>n.id===id)[0]
	let data = undefined
	if (n){
		data = n.data;
	}

	const { fitView } = useReactFlow();
	const focusNode = useCallback((id:string) => {
		const nodeId = id;
		fitView({
			nodes: [{ id: nodeId }], // Pass an array of nodes to fit in the view
			duration: 800,           // Animation duration in milliseconds
			padding: 0.2,            // Padding around the node
			maxZoom: 1.5,            // Maximum zoom level
		});
	}, [fitView]);

	return (
		<Card.Root
			onClick={(e:any)=>{
				focusNode(id);
				e.stopPropagation()
			}}
			variant={'elevated'}
			p={'10px'}
			style={{
				pointerEvents:'auto',
			}}
			>
			<SpEditorCtx.Provider value={useGraphCtx()}>
				<div className="fullW">
					{data.forward.map(
						(content: string, c_i: number)=> {
							return (
								<SpContent key={c_i} content={content}/>
							)
						})
					}
				</div>

				<div className="fullW">
					{data.backward.map(
						(content: string, c_i: number)=> {
							return (
								<SpContent key={c_i} content={content}/>
							)
						})
					}
				</div>
			</SpEditorCtx.Provider>
		</Card.Root>
	);
}

export const SpCard = React.memo(CardFC) as any;
