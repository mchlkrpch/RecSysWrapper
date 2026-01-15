import store from "../../storage";

// Checks if the current graphs chosen in searcher is editable?
// called when user select graph in searcher and placed on page
// g.${ID}, at this time state should contain userData with $id
// and owner (of current selected graph)
export function isGraphEditable(){
	const st = store.getState()
	let isEditable = false;
	if (
		st.userData &&
		st.owner &&
		st.owner.$id &&
		st.userData.$id===st.owner.$id
	){
		isEditable=true;
	}
	return isEditable
}

export const WAIT_USER_ACTION_TIME = 500;

export const getSearchPlaceholer=(tp:string)=>{
	switch(tp){
		case 'graphs':{
			return 'search graphs';
		}
		case 'users':{
			return 'search users';
		}
		default:
			return 'Ask your question';
	}
}

export const updatePermissions=(
	permissions: string[],
): string[] => {
	const userIds: string[] = [];
	const updatePermissions = permissions.filter(p => p.startsWith('update("'));
	for (const perm of updatePermissions) {
		const innerValue = perm.substring(perm.indexOf('"') + 1, perm.lastIndexOf('"'));
		if (innerValue.startsWith('user:')) {
			const userId = innerValue.substring(5);
			userIds.push(userId);
		}
	}
	return userIds;
};