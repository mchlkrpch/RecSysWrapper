// import React from 'react';
// import 'katex/dist/katex.min.css'; 
// import { Button } from '@chakra-ui/react';
// import './pdf-styles.css';

// const MarkdownPDFGenerator: React.FC<any>=
// (props:any)=>{
// 	const {
// 		ns,fileName
// 	}=props as any;
// 	const getTxt=(ns:any)=>{
// 		let txt=''
// 		ns.map((n:any)=>{
// 			txt+=`
// 			**${n.data.tp} ${n.data.forward[0]}**
// 			${n.data.forward.slice(1).join('\n')}
// 			---
// 			${n.data.backward.join('\n')}\n

// 			`
// 		})
// 		console.log('text:',txt)
// 		return txt;
// 	}

// 	const md = getTxt(ns)

// 	markdownpdf().from.string(md).to(`${fileName}.pdf`, function () {
// 		console.log("Created", `${fileName}.pdf`)
// 	})

//   return (
// 		<Button
// 			mb={'140px'}
// 			rounded={'full'}
// 			ml={'20px'} mr={'20px'}
// 			onClick={()=>{
// 				markdownpdf()
// 			}}
// 			flexGrow={1}
// 			variant={'outline'}
// 		>
// 				Export PDF
// 		</Button>
//   );
// };

// export default MarkdownPDFGenerator;