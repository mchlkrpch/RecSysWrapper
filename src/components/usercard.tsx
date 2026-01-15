import {
  Box,
  HStack,
	// Separator,
	Avatar,
	Strong,
	VStack,
	Text,
} from "@chakra-ui/react"
// @ts-expect-error: to ignore empy import react
import React from "react"

import { SpAvatar, unknownPhotoUrl } from "../pages/profile";
import store from "../storage";
import { History } from "../utils/history";
import { get_color_by_string } from "../utils/utils";

export default function UserCard(props:any) {
	const {userData}=props;
	const url = userData.photo_url;
	let showIncognito=false;
	if (url===null||url===undefined||url===unknownPhotoUrl||url.length < 4||url.slice(0,4)!=='http'){
		showIncognito=true;
	}

	return (
		<Box gap={'4px'} w={'100%'}
			p={'10px'}
			onClick={()=>{
				if (userData.$id===store.getState().userData.$id){
					History.push(`/profile`)
				}else {
					History.push(`/profile/${userData.$id}`)
				}
			}}
			>
			<HStack gap="10px">
				{/* <Box w={'44px'} h={'44px'} rounded={'full'} p={'2px'}
					alignItems={'center'}
					justifyContent={'center'}
					border={`2px solid color-mix(in srgb, ${get_color_by_string(userData.username)} 50%, transparent)`}
					>
				</Box> */}
				{!showIncognito&&(
					<SpAvatar
						w={'44px'} h={'44px'} rounded={'full'}
						border={`1px solid color-mix(in srgb, ${get_color_by_string(userData.username)} 50%, transparent)`}
						src={userData.photo_url}
						p={'2px'}
						username={userData.username}
					/>
				)}
				{showIncognito&&(
					<Avatar.Root w={'44px'} h={'44px'} opacity={0.5}>
						<Avatar.Fallback />
						<Avatar.Image src={unknownPhotoUrl} />
					</Avatar.Root>
				)}

				<VStack gap="0" align={'start'} fontSize={'14px'} opacity={0.8}
					fontWeight={300}
					>
					<Strong style={{opacity:1.0}} fontSize={'16px'}>
						{userData.username}
					</Strong>
					<Text fontSize={'11px'} opacity={0.3} fontWeight={500}>
						{userData.bio}
					</Text>
				</VStack>
			</HStack>
		</Box>
	)
}
