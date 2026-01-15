// @ts-expect-error: for jsx elements
import React from 'react';
import { useViewport } from '@xyflow/react';
import { Informate } from '../components/info';
import { ID } from 'appwrite';
import store from '../storage';

export const NEW_BLOCK_SPLITTER='\n---\n';
export const NEW_SIDE_SPLITTER='\n===\n';

export function CM2Text(j: any) {
	const fwdStr = j.forward.join(NEW_BLOCK_SPLITTER);
	const bwdStr = j.backward.join(NEW_BLOCK_SPLITTER);
	return fwdStr + NEW_SIDE_SPLITTER + bwdStr;
}

export function text2CM(s: any) {
	if (s=='') {
		return {
			tp:'Def',
			id: 'empty_id',
			forward:[''],
			backward:[''],
		}
	}

	// const regexExpr=/\[([^|]*)\|([^\]]*)\](.*)/g;
	// const matches = s.matchAll(regexExpr);
	// console.log('matches',matches)
	const regexExpr = /^\[(\w+)\|([^\]]+)\]\n(.*)/s;
	const match = s.match(regexExpr);

	let tp='';
	let id='';
	let rest='';
	
	console.log('m:',match)
	tp=match[1] || '';
	id=match[2] || '';
	rest=match[3] ||'';
	console.log('rest')

	if (!rest.includes('===')) {
		return {
			tp:tp,
			id:id,
			forward: rest.split(NEW_BLOCK_SPLITTER),
			backward: [],
		}
	}

	const sides=rest.split(NEW_SIDE_SPLITTER)
	return {
		tp:tp,
		id:id,
		forward: sides[0].split(NEW_BLOCK_SPLITTER),
		backward: sides[1].split(NEW_BLOCK_SPLITTER)
	}
}

export function ViewportDisplay() {
	const { x, y, zoom } = useViewport();
 
  return (
	<div style={{height: '0px', opacity: '0%'}}className='coords'>
		<input
			className=''
			value={x}
			onChange={()=>{}}
			data-id='x_coord'></input>
		<input
			className=''
			value={y}
			onChange={()=>{}}
			data-id='y_coord'></input>
		<input
			className=''
			value={zoom}
			onChange={()=>{}}
			data-id='cur_zoom'></input>
		<div
			className='box_stat'>{Math.round(x)}, {Math.round(y)}</div>
		<div className='box_stat'>zoom:{Math.round(zoom * 100) / 100}</div>
	</div>
  );
}
export function Coords() {
	const { x, y, zoom } = useViewport();
 
  return (
	<div className='viewport_stats'>
		<div
			className='box_stat'>{Math.round(x)}, {Math.round(y)}</div>
		<div className='box_stat'>zoom:{Math.round(zoom * 100) / 100}</div>
	</div>
  );
}

const colors: any = [
	'black',
	'blue',
	'cyan',
	'gray',
	'green',
	'orange',
	'pink',
	'purple',
	'red',
	'teal',
	'yellow',
	'white',
]
export function get_color_by_string(s: string): string {
	s = s.toLowerCase()
	const letter_number =  (s.charCodeAt(0) - 'a'.charCodeAt(0)) % colors.length
	return colors[letter_number]
}

export function is_katex_str(s: string): boolean {
	if (s.length > 1 && s[0] == '$' && s[s.length-1] == '$') {
		return true
	}
	return false
}
export function Cell(s: string) {
	return s
}

function getXY_screen() {
	let x_coord = 0
	let y_coord = 0
	let zoom = 0

	document.querySelectorAll('[data-id=x_coord').forEach(
		(el: any) => {
			x_coord = Math.round(el.value)
		}
	)

	document.querySelectorAll('[data-id=y_coord').forEach(
		(el: any) => {
			y_coord = Math.round(el.value)
		}
	)
	
	document.querySelectorAll('[data-id=cur_zoom').forEach(
		(el: any) => {
			zoom = el.value
		}
	)

	return [x_coord, y_coord, zoom]
}
export { getXY_screen }


const JSON_NODE_TEMPLATE = {
	type: "space_node",
	position: { x: 0, y: 0 },
	data: {
		nm: "new node",
		cnt: [{tp: 'text', content: 'new node'}],
		forward: [
			{tp: 'text', content: 'new node'},
		],
		backward: [
			{tp: 'text', content: 'new node'},
		],
		metadata: {
			id: "",
			history: [{dt:Date.now(), status:0}],
			level: 0,
			cur_level: 0,
			badges: [],
		},
	}
}

export function create_json_node(
	id: string,
	pos: any={x:0,y:0},
	cnt: any=[{tp: 'text', content: 'new node'}],
) {
	const n = JSON.parse(JSON.stringify(JSON_NODE_TEMPLATE))
	n.data.metadata.id = id
	n.position = pos
	n.data.cnt = cnt
	return n
}

export function create_n(
	id: string,
	pos: any,
	data: any,
) {
	const n = JSON.parse(JSON.stringify(JSON_NODE_TEMPLATE))
	n.data = data
	n.data.metadata.id = id
	n.position = pos
	return n
}

export function add_node_to_graph(): string {
	const [x_coord, y_coord, zoom] = getXY_screen()
	Informate('new cell', 'info')
	
	const n_id = ID.unique()
	const position = { x: Math.round((-x_coord + 400) / zoom) - 100, y: Math.round((-y_coord + 400) / zoom) }
	const g = store.getState().components['g']

	// add position for node
	const nodes_position = g.state.nodes_position
	nodes_position[n_id] = {
		type: "space_node",
		position: position,
	}
	// add data for node
	const node_data = g.state.node_data
	node_data[n_id] = {
		forward: ['new block'],
		backward: ['new block'],
		id: n_id,
	}

	// set changes for graph class component
	g.setState({
		n_nodes: g.state.n_nodes + 1,
		nodes_position: nodes_position,
		node_data: node_data,
	})
	return n_id
}

export function add_n(n: any) {
	const g_id = store.getState().g_id
	const g = store.getState().components['g']
	g.ns[n.data.metadata.id] = n

	const [, setNodes] = store.getState().components['setNodes']
	const graph_el = store.getState().components['GraphPage_'+g_id]
	setNodes(graph_el.rfns(g.ns))
	store.dispatch({
		type: 'load_n',
		payload: n,
	})
}


export function set_ids_to_repeat() {
	const node_data = store.getState().components['g'].state.node_data
	const ns_to_repeat: any = node_data
	store.dispatch({
		type: 'set_ns_to_repeat',
		payload: ns_to_repeat
	})
}

export const __fit_textarea_height = (textarea: any) => {
	if (!textarea)
		return
	textarea.style.height = 'auto';
	const newHeight = textarea.scrollHeight
	textarea.style.height = `${newHeight}px`
	return newHeight;
}

export function rgbaStringToHex(rgbaString: string, includeAlpha = false): string {
	// Parse RGBA values using regex
	const match = rgbaString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i);
	if (!match) throw new Error("Invalid RGBA string format");
	// Extract and clamp RGB values (0-255)
	const r = Math.max(0, Math.min(255, parseInt(match[1])));
	const g = Math.max(0, Math.min(255, parseInt(match[2])));
	const b = Math.max(0, Math.min(255, parseInt(match[3])));
	// Convert RGB to 6-digit hex
	const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	// Handle alpha if requested
	if (includeAlpha) {
		const alpha = match[4] ? parseFloat(match[4]) : 1;
		const aHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
			.toString(16)
			.padStart(2, '0');
		return `${hex}${aHex}`;
	}
	return hex;
}