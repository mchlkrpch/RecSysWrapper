import {
	Avatar,
	Badge,
	Box,
	Card,
	// Card,
	HStack,
	Icon,
	IconButton,
	Image,
	Strong,
	// Text,
	VStack
} from "@chakra-ui/react";
import React, { useState } from "react";
import { History } from "../../../utils/history";
import { LuTrash2 } from "react-icons/lu";
import { get_color_by_string } from "../../../utils/utils";
import { deleteGraph } from "../../../utils/appwrite";
import { SpContent } from "../../SpInput/body";
import { unknownPhotoUrl } from "../../../pages/profile";
import store from "../../../storage";

const SpGraphBriefCard = React.memo(
	function SpGraphBrief(props: any){
		const {
			isMobile,
			owner,
		}=props;
		const [isExpanded, setIsExpanded] = useState(false);
		const toggleExpansion = () => setIsExpanded(!isExpanded);

		let photo_url=undefined
		let username=undefined
		let ownerId=''
		if (owner && owner.photo_url && owner.photo_url!==''){
			photo_url=owner.photo_url;
			username=owner.username;
			ownerId=owner.$id;
		} else if (owner === undefined){
			photo_url=unknownPhotoUrl;
			username='unknown'
		}
		
		// const handleKeyDown = (event:any) => {
		// 	if (event.key === 'Enter' || event.key === ' ') {
		// 		event.preventDefault(); // Prevent page scroll on spacebar
		// 		toggleExpansion();
		// 	}
		// };

		return (
			<Box w={'100%'}
				padding={'10px'}
				backgroundColor={'white'}
				display={'flex'}
				onClick={async()=>{
					await store.dispatch({
						type: 'set_current_owner',
						payload: owner,
					})
					History.push('/graph.'+props.id)
				}}
				>
				<HStack gap={'10px'} w={'100%'}
					alignItems={'start'}
					>
					<Avatar.Root
						borderRadius={'sm'}
						variant={'outline'}
						w={'35px'}
						h={'50px'}
						mr={'-15px'}
						>
						<Avatar.Fallback
							name={props.name}
						/>
					</Avatar.Root>
					{photo_url&&(
						<Image src={photo_url}
							minW={'20px'}
							minH={'20px'}
							h={'20px'}
							w={'20px'}
							// ml={'-25px'}
							zIndex={'20'}
							// border={'1px solid #88eebb'}
							border={`1px solid color-mix(in srgb, ${get_color_by_string(username)} 50%, transparent)`}
							rounded={'full'}
							backgroundColor={'white'}
							>
						</Image>
					)}
					{!photo_url&&(
						<Avatar.Root
							minW={'20px'}
							minH={'20px'}
							h={'20px'}
							w={'20px'}
							zIndex={'20'}
							// border={'1px solid #88eebb'}
							border={`2px solid color-mix(in srgb, ${get_color_by_string(username)} 50%, transparent)`}
							rounded={'full'}
							>
							<Avatar.Fallback
								fontSize={'10px'}
								name={owner.username}
							/>
						</Avatar.Root>
					)}
					<VStack gap={0} w={'100%'} alignItems={'flex-start'}
					justifyContent={'flex-start'} justifyItems={'flex-start'}>
						<Strong opacity={'80%'} fontSize={'16px'}>
							{props.name}
						</Strong>
						<Badge
							fontWeight={500}
							fontSize={'11px'}
							p={'3px'}
							h={'12px'}
							maxH={'12px'}
							colorPalette={get_color_by_string(props.name)}
							>{props.nNodes} nodes
						</Badge>
						<HStack mt={'5px'} w={'100%'} alignItems={'start'}>
							<Box style={{
								opacity:'30%',
								fontSize:'14px',
							}}
							w={'100%'}
							maxLines={isExpanded ? undefined : 1}
							>
							<Card.Root
								// @ts-expect-error chakra can perform common style
								variant={'none'}
								onClick={(e:any)=>{
									toggleExpansion()
									e.stopPropagation();
									e.preventDefault();
								}}
								lineClamp={isExpanded==true?undefined:1}
								>
								<SpContent
									content={props.description}
									isInner={false}
								/>
							</Card.Root>
						</Box>
						</HStack>
					</VStack>

					{!isMobile&& ownerId===store.getState().userData.$id&&
					<Box>
						<IconButton
							h={'25px'}
							alignSelf={'flex-end'}
							variant={'outline'}
							size={'xs'}
							onClick={async (e:any)=>{
								e.preventDefault()
								e.stopPropagation()
								await deleteGraph(props.id)
							}}
						>
							<Icon as={LuTrash2} size='xs'/>
						</IconButton>
					</Box>
					}
				</HStack>
			</Box>
		)
	}
)

export default SpGraphBriefCard;