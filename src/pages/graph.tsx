import React from 'react';
import '@xyflow/react/dist/style.css';
import { History } from '../utils/history';

import Searcher from '../components/searcher/searcher';
import { Box } from '@chakra-ui/react';
import Header from '../components/header/header';
import store from '../storage';
import SpGraph from '../Sp/SpGraph/SpGraph';

export default class GraphPage extends React.Component<any,any> {
	constructor(props: any) {
		super(props)
		const id = History.loc().split('.')[1]
		const screenWidth = window.innerWidth;
		let marginBottom=''
		if (screenWidth<500){
			marginBottom='100px';
		}
		this.state={
			loaded: true,
			found: true,
			id: id,
			isMobile:screenWidth<500,
			marginBottom:marginBottom,
		}
	}

	render() {
		return(
			<Box
				w={'1920px'}
				maxW={'100%'}
				ml={'auto'}
				mr={'auto'}
				alignItems={'center'}
				h={'94vh'}
				display={'flex'}
				flexDirection={'column'}
				mb={this.state.marginBottom}
			>
				<Header userData={store.getState().userData} w={'1200px'}/>
				<Box
					flex={1}
					w={'100%'}
					h={'100%'}
					p={'0px'}
					minH={0}
					flexShrink={1}
					>
					<SpGraph.Root
						isMobile={this.state.isMobile}
						id={this.state.id} defaultMode={'EDIT'}
						editorRef={React.createRef()}
						// owner={}
					>
						<Searcher
							w={'1920px'}
							filters={{
								tp:`g.${this.state.id}`,
							}}
						/>
					</SpGraph.Root>
				</Box>
			</Box>
		)
	}
}