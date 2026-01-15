import { Button, HStack, Spacer } from "@chakra-ui/react";
import React from "react";
// import { ColorModeButton } from "../../../ui/color-mode";

const FooterFC: React.FC=()=>{
	return (
		<HStack
			w={'100%'}
			p={'0px'}
			overflow={'hidden'}
			style={{
				scrollbarWidth: 'none'
			}}
			>
			<Spacer/>
			<Button
				fontSize={'12px'}
				opacity={'30%'}
				variant={'plain'}
				w={'fit-content'}
				minH={'26px'}
				h={'26px'}
				p={0}
				onClick={()=>{
				}}
				>
				clear history
			</Button>
		</HStack>
	)
}

const ViewrFooter = React.memo(FooterFC)

export default ViewrFooter;