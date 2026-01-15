import React from 'react';
import { VStack } from '@chakra-ui/react';
import store from '../storage';
import Header from '../components/header/header';
import Searcher from '../components/searcher/searcher';

// class to cover all pahts in application when you are
// authorized, so it routes all pages inside the application
class SearchPage extends React.Component<any,any> {
	constructor(props: any) {
		super(props)
		this.state = {
			filters: props.filters,
			content: [],
			tm: 0,
			g_ids: [],
			search_ref: React.createRef(),
			searching: false,
		}
	}
	
	render() {
		return (
			<VStack h={'100%'}
				// backgroundColor={'yellow'}
				>
				<Header userData={store.getState().userData} w={'600px'}/>
				{/* searcher component: users/graphs/cards */}
				<Searcher
					w={'600px'}
					filters={{
						tp: 'graphs'
					}}
				/>
			</VStack>
		)
	}
}

export default SearchPage;