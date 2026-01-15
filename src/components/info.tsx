import { Card } from '@chakra-ui/react';
import store from '../storage';
import React from "react";


function Informate(msg: string, tp: string) {
	const el = store.getState().components['Info']
	el.setState({
		msg: msg,
		type: tp,
	})

	el.plan_collapse()
}


class Informator extends React.Component<any, {
		msg: string,
		type: string,
		is_mouse_over: boolean,
		// Auxilary variable to determine if the
		// component was mounted
		msg_ref: any,
	}> {
	constructor(props: any) {
		super(props)
		this.state = {
			msg: props.msg,
			type: props.type,
			is_mouse_over: false,
			msg_ref: React.createRef(),
		}
		store.dispatch({
			type: 'load_component',
			payload: {
				key: 'Info',
				component: this,
			}
		})
		this.plan_collapse()
	}

	plan_collapse(){
		setTimeout(()=>{
			if (this.state.msg_ref.current) {
				if (this.state.type != 'hide' && this.state.is_mouse_over == false) {
					this.setDefaultStyle()
				}
			}
		}, 2500)
	}

	setDefaultStyle() {
		this.setState({
			type: 'hide'
		})
	}

	render() {
		return (
			<Card.Root width="320px"
				ref={this.state.msg_ref}
				variant={'subtle'}
				onMouseLeave={()=>{
					this.setState({
						is_mouse_over: false,
					})

					setTimeout(()=>{
						if (this.state.is_mouse_over == false) {
							this.setDefaultStyle()
						}
					},1500)
				}}

				onMouseEnter={()=>{
					this.setState({
						is_mouse_over: true,
					})
				}}
				style={{display: this.state.type=='hide'? 'none': 'flex'}}
				className={
					this.state.type=='info'? 'message frame full info' :
					this.state.type=='warn'? 'message frame full warn': 'message frame full error'
				}
				>
				<Card.Body gap="2">
					<Card.Description>
						{this.state.msg}
					</Card.Description>
				</Card.Body>
			</Card.Root>
		)
	}
}

export { Informate }
export default Informator