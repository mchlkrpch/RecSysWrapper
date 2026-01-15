import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient("");

export const LLMreq=async(
	q:string="Hello, can you write a short story about a robot who discovers music?",
	cards=undefined,
)=>{
	if (cards===undefined){
		try {
			// const model="meta-llama/Llama-3.1-8B-Instruct";
			const model='meta-llama/Llama-3.3-70B-Instruct'
			const messages=[
				{
					role: "user",
					content:q
				},
			];
			const response = await hf.chatCompletion({
				model: model,
				messages: messages,
				max_tokens: 250,
			});
			return response.choices[0].message.content
		} catch (error) {
			console.error("Произошла ошибка:", error);
		}
	} else{
		try {
			// const model="meta-llama/Llama-3.1-8B-Instruct";
			const combinedPromt: string = `
here is cards: I have a question IN TERMS(!) of these cards:
${JSON.stringify(cards)},
and my question is:
${q}
			`;
			console.log('cmb p:', combinedPromt);

			const model='meta-llama/Llama-3.3-70B-Instruct'
			const messages=[
				{
					role: "user",
					content:combinedPromt
				},
			];
			const response = await hf.chatCompletion({
				model: model,
				messages: messages,
				max_tokens: 250,
			});
			return response.choices[0].message.content
		} catch (error) {
			console.error("Произошла ошибка:", error);
		}
	}
	return ''
}