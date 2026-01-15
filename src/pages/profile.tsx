// @ts-expect-error: to ignore empy import react 
import React, { useRef, useState } from 'react'
import {
	// Button,
	Field,
	HStack,
	Input,
	VStack,
	Box,
	Text,
	Spinner,
} from '@chakra-ui/react'
import { Image } from "@chakra-ui/react"
import { getUser, logOut, updateUserData } from '../utils/appwrite';
import store from '../storage';
import Header from '../components/header/header';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { get_color_by_string } from '../utils/utils';

const boxStyle=css`
	width: 100%;
	height: 100%;
	display: flex;
`;

const profileStyle=css`
	${boxStyle};
	flex-direction: column;
`;

const editBoxStyle=css`
	${boxStyle};
	flex-direction:column;

	&label{
		font-size: 10px;
		opacity: 0.4;
	}

	&input {
		min-height: 35px;
		max-height: 35px;
	}
`;

export const unknownPhotoUrl: string = "https://i.postimg.cc/MKZzBCG2/spaced-gray.png";
// export const unknownPhotoUrl = '/src/media/spaced_gray.png';

export function ProfileWrapper() {
	const { profileid } = useParams();
	return (
		<Profile
			key={profileid}
			id={profileid}
		/>
	)
}

export function SpAvatar(props:any) {
	let url = unknownPhotoUrl
	console.log('props.src',props.src)
	if (props.src && props.src.slice(0,5)==='https') {
		url=props.src
	}
	console.log('url:',url)
	return (
		<Box
			border={props.border}
			w={props.w}
			h={props.w}
			rounded={'full'}
			{...props}
			>
			<Image
				w={'100%'}
				h={'100%'}
				rounded={'full'}
				src={url}
				opacity={url===unknownPhotoUrl?0.15:1.0}
			/>
		</Box>
	)
}

export default function Profile(props:any){
	let userData=undefined;
	let user=undefined;

	const [loading,setLoading]=useState(true);
	if (props.id === undefined) {
		user=store.getState().user;
		userData=store.getState().userData;	
	}

	const [localUserData,setLocalUserData] = useState(userData);

	const usernameRef = useRef<HTMLInputElement>(null);
	const avatarRef = useRef<HTMLInputElement>(null);
	const bioRef = useRef<HTMLInputElement>(null);

	const f = async()=>{
		const newOtherUserData = await getUser(props.id) as any;
		setLoading(false);
		setLocalUserData(newOtherUserData)
	}
	if (localUserData===undefined){
		f();
	}
	if (loading && props.id) {
		return (
			<Spinner/>
		)
	}else {
		return (
			<>
				<div
				style={{
					display:'flex',
					alignItems:'center',
					width: '100%',
					maxWidth:'650px',
					marginLeft:'auto',
					marginRight:'auto',
				}}
				// @ts-expect-error: eslint has no plugin for handling new props
				css={profileStyle}>
				<Header userData={store.getState().userData} w={'600px'}/>
				<VStack
					w={'100%'}
					pt={'40px'}
					maxW={'100%'}
					gap="5"
					h={'100%'}
					p={'10px'}
				>
					<Box
						minH={'170px'}
						maxW={'170px'}
						h={'170px'}
						w={'170px'}
						>
						<SpAvatar
							src={localUserData.photo_url}
							username={localUserData.username}
							border={`4px solid color-mix(in srgb, ${get_color_by_string(localUserData.username)} 50%, transparent)`}
							p={'5px'}
							h={'170px'}
							w={'170px'}
						/>
					</Box>

					{!props.id?
					<Box css={editBoxStyle} gap={'10px'} border={0}>

						<HStack gap="2" width="full">
							<Field.Root gap='-0.5'>
								<Field.Label fontSize={'12px'} opacity="0.5">
									username<Field.RequiredIndicator />
								</Field.Label>
								<Input
									ref={usernameRef}
									placeholder="Enter you email"
									variant="flushed"
									defaultValue={localUserData.username}
								/>
								<Field.ErrorText>This field is required</Field.ErrorText>
							</Field.Root>

							<Field.Root gap='-0.5'>
								<Field.Label fontSize={'12px'} opacity="0.5">
									avatar link <Field.RequiredIndicator />
								</Field.Label>
								<Input
									ref={avatarRef}
									placeholder="use 8 symbols"
									variant="outline"
									defaultValue={localUserData.photo_url}
								/>
								<Field.ErrorText>This field is required</Field.ErrorText>
							</Field.Root>
						</HStack>
						<Input
							ref={bioRef}
							placeholder="bio"
							variant={'flushed'}
							defaultValue={localUserData.bio}
						/>

						<button
							className='trigger-button'
							style={{
								backgroundColor:'#D1F6BD',
								color:'#6D9855',
							}}
							onClick={async ()=>{
								const newUserData = JSON.parse(JSON.stringify(localUserData))
								newUserData.username = usernameRef.current?.value||'';
								newUserData.photo_url = avatarRef.current?.value||'';
								newUserData.bio = bioRef.current?.value||'';

								await updateUserData(
									user,
									newUserData,
									true
								)
								setLocalUserData(newUserData);
							}}
							>
							Save profile
						</button>

						<button
							className='trigger-button'
							onClick={()=>{
								const SpaceRouter=store.getState().components['SpaceRouter']
								SpaceRouter.setState({
									user:null,
								})
								logOut()
							}}
						>
							Log out
						</button>
					</Box>
					:(
						<>
							<Text>{localUserData.username}</Text>
							<Text>{localUserData.bio}</Text>
						</>
					)}
				</VStack>
			</div>
			</>
		)
	}
}
