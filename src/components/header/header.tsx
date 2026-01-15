import React from "react";
import { Avatar, Box, Button, createOverlay, Dialog, Icon, Image, Portal, Spacer, Tabs, Text } from "@chakra-ui/react";
import { History } from "../../utils/history";

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { unknownPhotoUrl } from "../../pages/profile";
// import { SpContent } from "../../Sp/SpInput/body";
import { LuBookCheck, LuSearch } from "react-icons/lu";
// import HOW_TO_PAGES from '../../media/howtopages.md?raw';
// import HOW_TO_GRAPH from '../../media/howtograph.md?raw'

import logo from '../../media/space-var-3.png';
import { LightMode } from "../../Sp/ui/color-mode";

// increase opacity when .child hovered
const headerStyle = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background-color: var(--chakra-colors-bg-subtle);
	max-width: 100%;
	flex-shrink: 0;
	// background-color: #111;
	// color: black;

	gap: 5px;

	font-size: 13px;
	font-weight: 300;
	padding-left: 20px;
	padding-right:20px;

	.child{
		padding: 0;
		font-size: inherit;
		font-weight: 400;
		opacity: 0.4;
		color: black;
	}
	// .child:hover{
	// 	opacity: 1.0;
	// }

	.help{
		cursor: pointer;
		display: flex;
		align-items: center;
	}
`;

// increase .child's opacity when item ishovered
const itemStyle = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	cursor: pointer;
	padding: 0;
	font-size: inherit;
	font-weight: inherit;
	gap: 2px;

	// &:hover .child{
	// 	opacity: 1.0;
	// }
`;

interface DialogProps {
  title: string
  description?: string
  content?: React.ReactNode
}

const dialog = createOverlay<DialogProps>((props:any) => {
  const {
		...rest
	} = props as any;
	const SpAv=(props:any)=>{
		const{
			txt,
		}=props;
		return (
			<Avatar.Root
				minW={'20px'}
				minH={'20px'}
				h={'40px'}
				w={'40px'}
				zIndex={'20'}
				border={`2px solid black`}
				backgroundColor={'white'}
				rounded={'full'}
				>
				<Avatar.Fallback
					fontSize={'10px'}
					name={txt}
				/>
			</Avatar.Root>
		)
	}
  return (
    <Dialog.Root {...rest}>
      <Portal>
				<LightMode>
					<Dialog.Backdrop />
					<Dialog.Positioner>
						<Dialog.Content
							h={'600px'}
							overflowY={'auto'}
							color={'black'}
							backgroundColor={'white'}
							p={0}
							// @ts-expect-error hidden in chakra comps
							// eslint-disable-next-line
							overflowY={'hidden'}
							>
							{/* <Dialog.Header>
								<Dialog.Title>How to use</Dialog.Title>
							</Dialog.Header> */}
							<Dialog.Body spaceY="4px" w={'100%'} display='flex'>
								<Tabs.Root
									defaultValue="search"
									variant={'enclosed'}
									alignItems={'center'}
									justifyContent={'center'}
									p={0}
									h={'100%'}
									flexGrow={1}
									>
									<Tabs.List ml={'auto'} mr={'auto'}>
										<Tabs.Trigger value="search">
											search
										</Tabs.Trigger>
										<Tabs.Trigger value="graph">
											Graph page
										</Tabs.Trigger>
										<Tabs.Trigger value="profile">
											profile
										</Tabs.Trigger>
									</Tabs.List>

									<Tabs.Content
										display={'flex'}
										value="search" flexGrow={1}
										w={'100%'}
										h={'100%'}
										p={0}
									>
										{/* <SpContent
											content={HOW_TO_PAGES}
										/> */}
										<img
											style={{
												marginTop:'auto',
												marginBottom:'auto',
											}}
											src={'https://i.postimg.cc/kMbLwyTw/s1-1.png'}
											alt={'search'}
										/>
									</Tabs.Content>
									<Tabs.Content
										value="graph"
										alignItems={'center'}
										h={'100%'}
										flexGrow={1}
										p={0}
									>
										{/* <SpContent
											content={HOW_TO_GRAPH}
										/> */}
										<Tabs.Root
											defaultValue="1"
											variant="plain"
											h={'100%'}
											flexGrow={1}
											p={0}
											>
											<Tabs.Content value='1' p={0}>
												<img
													src={'https://i.postimg.cc/W1kVZPxy/c1-1.png'}
													alt={'search'}
												/>
											</Tabs.Content>
											<Tabs.Content value='2' p={0}>
												<img
													src={'https://i.postimg.cc/zDc4Fcwm/c2-1.png'}
													alt={'search'}
												/>
											</Tabs.Content>
											<Tabs.Content
												value='3'
												w={'100%'}
												p={0}
											>
												<img
													src={'https://i.postimg.cc/J4wCWFsZ/c4-1.png'}
													alt={'search'}
												/>
											</Tabs.Content>

											<Box
												flexGrow={1}
												alignItems={'center'}
												justifyContent={'center'}
												mt={'70px'}
												display={'flex'}
											>
												<Tabs.List gap={'2px'}
													alignItems={'center'}
													justifyContent={'center'}
													ml={'auto'}
													mr={'auto'}
													display={'flex'}
												>
													<Tabs.Trigger value="1" ml={'auto'}>
														<SpAv txt={'1'}/>
													</Tabs.Trigger>
													<Tabs.Trigger value="2">
														<SpAv txt={'2'}/>
													</Tabs.Trigger>
													<Tabs.Trigger value="3" mr={'auto'}>
														<SpAv txt={'3'}/>
													</Tabs.Trigger>
												</Tabs.List>
											</Box>
										</Tabs.Root>
									</Tabs.Content>
									<Tabs.Content value="profile">
										<img
											src={'https://i.postimg.cc/CKbw3VNf/p1-3.png'}
											alt={'search'}
										/>
									</Tabs.Content>
								</Tabs.Root>
							</Dialog.Body>
						</Dialog.Content>
					</Dialog.Positioner>
				</LightMode>
      </Portal>
    </Dialog.Root>
  )
})

export default function Header(props: any){
	const {
		userData,
		w,
	} = props;
	const photo_url = (userData&&userData.photo_url)?userData.photo_url:unknownPhotoUrl;
	const username = (userData&&userData.username)?userData.username:'';

	return (
		// @ts-expect-error: eslint has no plugin for handling new props
		<span style={{width:w}} css={headerStyle}>
			<Box style={{
				borderRadius:'40px',
				paddingLeft: '10px',
				paddingRight:'5px',
				height: '30px',
				maxHeight: '30px',
				display:'flex',
				flexDirection:'row',
				alignItems:'center',
				justifyContent:'center',
				backgroundColor: '#eee'
			}}>
				<Image
					w={'15px'} h={'15px'}
					src={logo}
					backgroundColor={'#222'}
					rounded={'3px'}
				/>
				<Button
					css={itemStyle}
					className="child"
					variant={'plain'}
					onClick={()=>History.push('/search')}
					>
					<Icon as={LuSearch} size="md" color='#444'/>
					{/* search */}
				</Button>
			</Box>
			<Spacer/>
			<dialog.Viewport />
			<Box
				rounded={'full'}
				backgroundColor={'#ddd'}
				// border={'1px solid blue'}
				// p={'10px'}
				pl={'20px'}
				className='child help'
				onClick={()=>{
					dialog.open("a", {
            title: "Dialog Title",
            description: "Dialog Description",
          })
				}}
				>
				<LuBookCheck style={{
					marginLeft:'10px',
					marginRight:'4px',
					width: '15px', height: '15px'
				}}/>
				<Text
					mr={'10px'}
					mt={'4px'}
					mb={'4px'}
					verticalAlign={'middle'}
					justifyContent={'center'}
				>
					How to use
				</Text>
			</Box>
			<Spacer/>
			{/* eslint-disable-next-line */}
			<div
				onClick={()=>History.push('/profile')}
				// @ts-expect-error: eslint has no plugin for handling new props
				css={itemStyle}>
				<Image
					w={'22px'} h={'22px'}
					src={photo_url}
					rounded={'full'}
				/>
				<Button
					className="child"
					variant={'plain'}
					>
					{username}
				</Button>
			</div>
		</span>
	)
}