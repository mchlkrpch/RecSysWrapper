import store from "../storage"
import { Informate } from "../components/info";

let prev_tmst = 0

const handleSpecialShortCuts = () => {
	const s = store.getState()
	// All execution before press handle
	document.documentElement.addEventListener(
		"keydown",
		async (ev) => {
			if (ev.timeStamp != prev_tmst) {
				// Prevent repeating events
				// so it will evokes once
				prev_tmst = ev.timeStamp
				// get elements neede to perform shortcut
				const viewer = s.components['Viewer']

				if (ev.key == 's' && s.keyboard['Control'] == true) {
					const g = store.getState().components['g']
					const [,,nodes,edges] = store.getState().components['flow']
					await g.setState({
						reactflow_nodes: nodes,
						edges: edges,
					})

					g.save_brief()					
					g.save_position()
					g.save_nodes()
					g.save_history()

					Informate('Graph save successfully', 'info')
					ev.stopPropagation()
					ev.preventDefault()
				}

				// const repeat_el = store.getState().components['Repeat']
				// if (ev.key == ' '){
				// 	if (!(ev.target instanceof HTMLTextAreaElement  || ev.target instanceof HTMLInputElement)) {
				// 		if (repeat_el.state.repeat_process_ref.current != null) {
				// 			repeat_el.setState({
				// 				isCardBackHidden: repeat_el.state.isCardBackHidden == true? false: true,
				// 			})
				// 		}
				// 	}
				// }
				// if (ev.key == 'ArrowLeft') {
				// 	if (!(ev.target instanceof HTMLTextAreaElement  || ev.target instanceof HTMLInputElement)) {
				// 		if (repeat_el.state.repeat_process_ref.current != null) {
				// 			repeat_el.setState({
				// 				isCardBackHidden: true,
				// 			})
				// 			repeat_el.forget()
				// 		}
				// 	}
				// }
				// if (ev.key == 'ArrowRight') {
				// 	if (!(ev.target instanceof HTMLTextAreaElement  || ev.target instanceof HTMLInputElement)) {
				// 		if (repeat_el.state.repeat_process_ref.current != null) {
				// 			repeat_el.setState({
				// 				hidden: true,
				// 			})
				// 			repeat_el.remember()
				// 		}
				// 	}
				// }
				if (ev.key == 'Enter' && s.keyboard['Control'] == true && viewer.state.n != undefined) {
					const spaceField = viewer.unselect_cur_cell()
					viewer.update_cell(spaceField.state.index, spaceField.state.content)

					viewer.append_focus(
						{content: '', tp: 'text'},
						viewer.state.index+1
					)
				}
				
				if (ev.key == 'q' && s.keyboard['Control'] == true) {
					const g = store.getState().components['g']
					g.edit_node()
					ev.stopPropagation()
					ev.preventDefault()
				}
			}
		},
		true,
	)
}

function shortCutManager() {
	// let st = store.getState()
}

const keyboard_callback = () => {
	document.addEventListener(
		'keydown',
		(e: KeyboardEvent) => {
			store.dispatch({
				type: 'keydown',
				payload: e.key,
			})

			shortCutManager()
		}
	)

	document.addEventListener(
		'keyup',
		(e: KeyboardEvent) => {
			store.dispatch({
				type: 'keyup',
				payload: e.key,
			})
		}
	)
}


export { handleSpecialShortCuts }
export default keyboard_callback