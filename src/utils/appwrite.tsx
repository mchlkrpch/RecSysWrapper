import { Client, Account, Databases, Permission, Role } from 'appwrite';
import { Query, ID } from 'appwrite';
import store from "../storage";
import { History } from "../utils/history";

export const spaced_client = new Client()
	.setEndpoint('https://fra.cloud.appwrite.io/v1')
	.setProject('683cd1ba0027b46622e7');

export const spaced_account = new Account(spaced_client);
export const spaced_databases = new Databases(spaced_client);

export const GRAPHS_DB_ID = '683d7c380015a78176fa'
export const PUBLIC_COLLECTION_NAME = 'public'

export const space_db_id = '683d7c380015a78176fa';
export const user_collection_id = '68406713000d4d6b84c5';

export const NODES_COLLECTION_ID: string = '685f19b7000375b03cc6';
export const NAMESPACE_COLLECTION_ID: string = '688e2c2e000698722d65';

class UserTemplate {
	id: string;
	username: string;
	email: string;
	photo_url: string;
	bio: string;

	constructor(
		id: string,
		username: string,
		email: string,
		photo_url: string,
		bio: string,
	) {
		this.id = id
		this.username = username
		this.email = email
		this.photo_url = photo_url
		this.bio = bio
	}

	toJson() {
		return {
			id: this.id,
			username: this.username,
			email: this.email,
			photo_url: this.photo_url,
			bio: this.bio,
		}
	}
}

export { UserTemplate }


////////////////////////////////////////////////////////////////////////////////

// user requests

////////////////////////////////////////////////////////////////////////////////


export const getUsers = async () => {
	try {
		const response = await spaced_databases.listDocuments(
			space_db_id,
			user_collection_id,
		);
		return response.documents;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
};

export const getUser = async (id:string) => {
	try {
		const response = await spaced_databases.listDocuments(
			space_db_id,
			user_collection_id,
			[
				Query.equal('$id', id),
				Query.limit(1),
			],
		);
		return response.documents[0];
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
};

async function UD_create(u: any) {
	try {
		const cell = {
			0: JSON.stringify(u),
			'username': u.name,
			'email': u.email,
			'photo_url': null,
			'bio': '',
		}
		await spaced_databases.createDocument(
			space_db_id,
			user_collection_id,
			u.$id,
			cell,
		)
		return cell
	} catch(e) {
		console.error('ud_create:', e)
	}
}

export const getUserData = async (u: any) => {
	// get all users from collection
	const response = await spaced_databases.listDocuments(
		space_db_id,
		user_collection_id,
		[
			Query.equal('$id', u.$id),
			Query.limit(1)
		]
	)
	const found = response.documents.length > 0
	if (found == true) {
		return response.documents[0]
	}
	const ud = await UD_create(u)
	return ud
};

export async function updateUser(
	user: any,
	force_replace: boolean=false,
) {
	const response = await spaced_databases.listDocuments(
		space_db_id,
		user_collection_id,
		[
			Query.equal('$id', user.$id),
			Query.limit(1)
		]
	);
	const found = response.documents.length > 0
	if (found && force_replace) {
		await spaced_databases.updateDocument(
			space_db_id,
			user_collection_id,
			user.$id,
			user
		);
	}
	if (!found) {
		await UD_create(user)
	}
}

export async function updateUserData(
	user: any,
	userData: any,
	force_replace: boolean=false,
) {
	const response = await spaced_databases.listDocuments(
		space_db_id,
		user_collection_id,
		[
			Query.equal('$id', user.$id),
			Query.limit(1)
		]
	);
	const found = response.documents.length > 0
	if (found && force_replace) {
		const newUserData = {
			'username': userData.username,
			'photo_url': userData.photo_url,
			'bio': userData.bio,
		}
		await spaced_databases.updateDocument(
			space_db_id,
			user_collection_id,
			user.$id,
			newUserData,
		);
		store.dispatch({
			type:'set_user',
			payload: [user,newUserData],
		})
	}
	if (!found) {
		await UD_create(user)
	}
}

export async function fetch_user(acc: any) {
	try {
		const u = await acc.get();
		const ud = await getUserData(u)
		store.dispatch({
			type: 'set_user',
			payload: [u, ud]
		})
		const auth_el = store.getState().components['SpaceRouter']
		auth_el.setState({
			user: u,
		})
		return u
	} catch(e:any) {
		console.error('[fetch_user]',e.code, e)
	}
}

export async function logOut() {
	try {
		await store.dispatch({
			type: 'set_user',
			payload: [undefined, undefined],
		})
		await spaced_account.deleteSession('current')
		History.push('/auth')
	} catch (e) {
		console.error('Ошибка при выходе:', e)
	}
};



////////////////////////////////////////////////////////////////////////////////

// graph requests

////////////////////////////////////////////////////////////////////////////////

export const graph_collection_id = '68406706001bbbcdb460'

export const NEW_GRAPH_NAME: string = 'New graph'
export const NEW_GRAPH_DESCRIPTION: string = 'description of new graph'

export const graph_brief_collection_id = '685f13a4001759002a35'
export const graph_config_colleciton_id = '6840671b002176ad937d'
export const node_data_colleciton_id = '685f19b7000375b03cc6'
export const tags_collection_id = '686e7a3c002caa516b33'
export const graph_history_collection_id = '686fbb8f0013b47826dd'


const GRAPH_CONFIG_NEW_DOC = {
	nodeIds:[],
	viewsIds:[],
	parentId:null,
	name:'new graph',
	description:'new created graph description',
	nNodes:0,
	owner:'',
	editors:[],
	blackList:[],
}



// export const createMyGraph=async({
// 	ns,
// 	parentId,
// 	name,
// 	description,
// }:any)=>{
// 	try {
// 		const user = await spaced_account.get();
// 		const userId = user.$id;
// 		const gId=ID.unique();
// 		const g=GRAPH_CONFIG_NEW_DOC
// 		if (ns){
// 			g.nodeIds=ns
// 		}
// 		if(parentId){
// 			g.parentId=parentId
// 		}
// 		if (name){
// 			g.name=name
// 		}
// 		if (description){
// 			g.description=description
// 		}
// 		await spaced_databases.createDocument(
// 			space_db_id,
// 			NAMESPACE_COLLECTION_ID,
// 			gId,
// 			g,
// 			[
// 				Permission.read(Role.any()),
// 				Permission.update(Role.user(userId)),
// 				Permission.delete(Role.user(userId)),
// 			]
// 		);
// 		return gId;
// 	} catch (error) {
// 		console.error('Ошибка при создании документа:', error);
// 		throw error;
// 	}
// };

export const updateViewsIds = async ({
	parentId,
	gId,
	userId,
}: any)=>{
	try {
		const parentDoc = await spaced_databases.getDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			parentId
		);

		let currentViewsIds = parentDoc.viewsIds || [];
		if (!currentViewsIds.includes(gId)) {
			currentViewsIds = [...currentViewsIds,gId];
		}
		const updateData = {
			viewsIds: currentViewsIds,
		};

		await spaced_databases.updateDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			parentId,
			updateData,
			[
				Permission.read(Role.any()),
				Permission.update(Role.user(userId)),
				Permission.delete(Role.user(userId)),
			]
		);
		return true;
	} catch (error) {
		console.error('Error updating viewsIds:', error);
		throw error;
	}
};

// You can then integrate this into your createMyGraph function like this:
export const createMyGraph = async ({
	ns,
	parentId,
	name,
	description,
}: any) => {
	try {
		const user = await spaced_account.get();
		const userId = user.$id;
		const gId = ID.unique();
		const g = { ...GRAPH_CONFIG_NEW_DOC };
		if (ns) {
			g.nodeIds = ns;
		}
		if (parentId) {
			g.parentId = parentId;
		}
		if (name) {
			g.name = name;
		}
		if (description) {
			g.description = description;
		}
		g.owner=userId;

		await spaced_databases.createDocument(
			space_db_id,
			NAMESPACE_COLLECTION_ID,
			gId,
			g,
			[
				Permission.read(Role.any()),
				Permission.update(Role.user(userId)),
				Permission.delete(Role.user(userId)),
			]
		);
		if (parentId) {
			await updateViewsIds({ parentId, gId, userId });
		}
		return gId;
	} catch (error) {
		console.error('Ошибка при создании документа:', error);
		throw error;
	}
};


export const grantEditPermission = async (
  documentId: string,
  targetUserId: string // Убедитесь, что это КОРОТКИЙ ID пользователя!
) => {
  try {
    // 1. Получаем текущий документ
    const document = await spaced_databases.getDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId
    );

    const currentPermissions = document.$permissions;

    // 2. Формируем новое право. Используем Permission.write()!
    // const newPermissionString = Permission.write(Role.user(targetUserId)); 
		// const newPermission = `update("user:${targetUserId}")`;

    // 3. ПРАВИЛЬНАЯ ПРОВЕРКА: Ищем право для этого пользователя
    // Ищем в массиве currentPermissions строку, которая содержит и 'write' и targetUserId.
    const hasPermissionAlready = currentPermissions.some(perm => 
      perm.includes('write') && perm.includes(targetUserId)
    );

    if (hasPermissionAlready) {
      return document;
    }
    // 5. ВАЖНО! Правильно передаем аргументы в updateDocument.
    // Четвертый аргумент - данные (мы их не меняем, поэтому {}).
    // Пятый аргумент - новый массив прав (updatedPermissions).
    const updatedDocument = await spaced_databases.updateDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId,
      {}, // Пустой объект, так как мы не меняем данные документа, только права
      [
				Permission.read(Role.any()),
				Permission.create(Role.any()),
				Permission.update(Role.user(targetUserId)),
			],
    );
    return updatedDocument;

  } catch (error) {
    console.error('Ошибка при выдаче прав:', error);
    throw error; // Пробрасываем ошибку выше, чтобы обработать ее в компоненте
  }
};



/**
 * Отзывает право на редактирование (update) документа у указанного пользователя.
 * @param {string} documentId - ID документа, права которого изменяются.
 * @param {string} targetUserId - ID пользователя, у которого отзываются права.
 */
export const revokeEditPermission=async(
	documentId:string,
	targetUserId:string
) => {
  try {
    // Безопасная проверка: не позволяем пользователю отозвать права у самого себя.
    // Это может привести к потере контроля над документом.
    // Для этого нужно использовать функцию передачи владения.
    const currentUser = await spaced_account.get();
    if (currentUser.$id === targetUserId) {
      throw new Error("Вы не можете отозвать права у самого себя. Для этого используйте функцию передачи владения.");
    }

    // 1. Получаем документ, чтобы прочитать его текущие разрешения
    const document = await spaced_databases.getDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId
    );
    const currentPermissions = document.$permissions;

    // 2. Определяем строку разрешения, которую нужно удалить
    const permissionToRemove = Permission.update(Role.user(targetUserId));

    // Проверяем, есть ли у пользователя вообще такое право
    if (!currentPermissions.includes(permissionToRemove)) {
      return document; // Возвращаем документ без изменений
    }

    // 3. Создаем новый массив, отфильтровав ненужное разрешение
    const newPermissions = currentPermissions.filter(
      (p) => p !== permissionToRemove
    );

    // 4. Обновляем документ с новым массивом разрешений
    const updatedDocument = await spaced_databases.updateDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId,
      {},
      newPermissions
    );
    return updatedDocument;

  } catch (error) {
    console.error('Ошибка при отзыве прав:', error);
    throw error;
  }
};





// documentId - ID документа, у которого меняется владелец
// newOwnerId - ID пользователя, который станет новым владельцем
export const transferOwnership = async (documentId: string, newOwnerId: string) => {
  try {
    const currentUser = await spaced_account.get();
    const currentOwnerId = currentUser.$id;
    if (currentOwnerId === newOwnerId) {
        return;
    }

    // 1. Получаем документ
    const document = await spaced_databases.getDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId
    );
    
    // 2. Фильтруем разрешения: убираем права старого владельца
    const filteredPermissions = document.$permissions.filter(p =>
      !p.startsWith(`update("user:${currentOwnerId}")`) &&
      !p.startsWith(`delete("user:${currentOwnerId}")`)
    );

    // 3. Добавляем права для нового владельца
    const newOwnerPermissions = [
      ...filteredPermissions,
      Permission.update(Role.user(newOwnerId)),
      Permission.delete(Role.user(newOwnerId)),
    ];

    // 4. Обновляем документ
    const updatedDocument = await spaced_databases.updateDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      documentId,
      {},
      newOwnerPermissions
    );
    return updatedDocument;

  } catch (error) {
    console.error('Ошибка при передаче владения:', error);
    throw error;
  }
};








export async function createGraph() {
	const id = ID.unique()

	await spaced_databases.createDocument(
		space_db_id,
		NAMESPACE_COLLECTION_ID,
		id,
		GRAPH_CONFIG_NEW_DOC,
	);
	return id
}

// export async function deleteGraph(id: string) {
// 	await spaced_databases.deleteDocument(
// 		space_db_id,
// 		NAMESPACE_COLLECTION_ID,
// 		id,
// 	);
// }
export const deleteGraph = async (graphId: string) => {
  try {
    // SDK автоматически добавит информацию о текущей сессии.
    await spaced_databases.deleteDocument(
      space_db_id,
      NAMESPACE_COLLECTION_ID,
      graphId
    );
    return true;

  } catch (error) {
    console.error(`Ошибка при удалении документа ${graphId}:`, error);
    throw error;
  }
};

export async function updateGraph(
	g_id: string,
	g: any,
	force_replace: boolean = false
) {
	const response = await spaced_databases.listDocuments(
		space_db_id,
		graph_collection_id,
		[
			Query.equal('$id', g_id),
			Query.limit(1)
		]
	);
	const found = response.documents.length > 0

	if (found && force_replace) {
		await spaced_databases.updateDocument(
			space_db_id,
			graph_collection_id,
			g_id,
			{
				'json': JSON.stringify(g),
				'description': JSON.stringify(g.description),
				'name': g.nm,
			}
		);
	}
	if (!found) {
		const g_s = JSON.stringify(g)
		await spaced_databases.createDocument(
			space_db_id,
			graph_collection_id,
			ID.unique(),
			{
				'json': g_s,
				'description': JSON.stringify(g.description),
				'name': g.nm,
			}
		);
	}
}

export async function fetchGraph(
	g_id: string,
) {
	const [doc]: any = (await spaced_databases.listDocuments(
		space_db_id,
		graph_brief_collection_id,
		[
			Query.equal('$id', g_id),
			Query.limit(1)
		]
	)).documents
	return doc
}

export async function fetchGraphs(
	limit: number,
) {
	const docs = (await spaced_databases.listDocuments(
		space_db_id,
		graph_brief_collection_id,
		[
			Query.limit(limit)
		]
	)).documents
	return docs
}

// Note: The previous UI-related code (GraphMode, class G, ReactFlow) was moved to legacy.
export const GraphMode = {
	LOADING: 'loading',
	BRIEF: 'brief',
	GRAPH: 'graph',
	REPEAT: 'repeat',
} as const;

const databases = new Databases(spaced_client);

export async function migrateData() {
	let cursor = null;
	let updatedCount = 0;
	try {
		while (true) {
			const queries = [
				Query.limit(100),
				Query.isNull('txt'),
			];
			if(cursor){
				queries.push(Query.cursorAfter(cursor));
			}
			const response = await databases.listDocuments(
				space_db_id,
				NODES_COLLECTION_ID,
				queries
			);
			const documents = response.documents;
			if (documents.length === 0) {
				break;
			}
			// Создаем массив промисов для параллельного обновления
			const updatePromises = documents.map(doc => {
				const contentParts = [
					...(doc.forward || []),
					...(doc.backward || []),
				];
				const searchableContent = contentParts.join(' ').trim();
				if (searchableContent) {
					return databases.updateDocument(
						space_db_id,
						NODES_COLLECTION_ID,
						doc.$id,
						{
							txt: searchableContent,
						}
					).then(() => {
						updatedCount++;
						console.log(`Документ ${doc.$id} обновлен.`);
					}).catch(err => {
						console.error(`Ошибка при обновлении документа ${doc.$id}:`, err);
					});
				}
			});
			await Promise.all(updatePromises);
			cursor=documents[documents.length-1].$id;
		}
	} catch (e) {
		console.error('Произошла критическая ошибка:', e);
	} finally {
		console.log(`\nМиграция завершена: ${updatedCount}`);
	}
}