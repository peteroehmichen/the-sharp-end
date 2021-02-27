import axios from "./axios";

export async function getUserData(id) {
    // console.log("Going to fetch user data:");
    try {
        const { data } = await axios.get(`/in/userData.json?id=${id}`);
        // console.log("received", data);
        return {
            type: "FULL_USER_DATA",
            payload: data,
            id: id,
        };
    } catch (err) {
        console.log("Received an error on /user:", err);
        return {
            type: "FULL_USER_DATA",
            payload: { error: "No Connection to Database" },
            id: id,
        };
    }
}

export async function updateUserData(values) {
    try {
        const { data } = await axios.post("/in/updateUserData.json", values);
        // console.log("reveived:", data);
        return {
            type: "UPDATE_USER_DATA",
            payload: values,
        };
    } catch (error) {
        return {
            type: "UPDATE_USER_DATA",
            payload: error,
        };
    }
}

export function toggleLocationForm() {
    return { type: "TOGGLE_LOCATION_FORM" };
}

export async function addNewLocation(values) {
    // console.log("writing new Location:", values);
    try {
        const { data } = await axios.get(
            `in/addLocation.json?continent=${values.continent}&country=${values.country}&name=${values.name}`
        );
        // console.log("response:", data);
        if (data.success) {
            return {
                type: "ADD_NEW_LOCATION",
                payload: values,
            };
        } else {
            return {
                type: "ADD_NEW_LOCATION",
                error: data.error,
            };
        }
    } catch (error) {
        return {
            type: "ADD_NEW_LOCATION",
            error: "Could not access Server",
        };
    }
}

export async function getLocations() {
    // console.log("getting all Locations");
    try {
        const { data } = await axios.get(`in/getLocations.json`);
        // console.log("response:", data);
        if (data.success) {
            return {
                type: "GET_LOCATIONS",
                payload: data.success,
            };
        } else {
            return {
                type: "GET_LOCATIONS",
                error: data.error,
            };
        }
    } catch (error) {
        return {
            type: "GET_LOCATIONS",
            error: "Could not retrieve Locations",
        };
    }
}

/*
import axios from "./axios";
import { analyseMessages } from "./helpers";

export async function getList() {
    const { data } = await axios.get("/api/friends.json");
    // console.log("data from server", data);
    return {
        type: "GET_ALL_RELATIONS",
        payload: data,
    };
}

export async function unfriend(id) {
    // console.log("Going to unfriend id", id);
    const { data } = await axios.post("/api/user/friendBtn.json", {
        task: "Cancel Friendship",
        friendId: id,
    });
    console.log("received:", data);
    if (!data.error) {
        return {
            type: "CANCEL_FRIENDSHIP",
            payload: id,
        };
    }
}

export async function acceptRequest(id) {
    // console.log("Going to accept id", id);
    const { data } = await axios.post("/api/user/friendBtn.json", {
        task: "Accept Request",
        friendId: id,
    });
    if (!data.error) {
        return {
            type: "ACCEPT_REQUEST",
            payload: id,
        };
    }
}

export async function denyRequest(id) {
    // console.log("Going to deny id", id);
    const { data } = await axios.post("/api/user/friendBtn.json", {
        action: "Deny Request",
        task: id,
    });
    if (!data.error) {
        return {
            type: "DENY_REQUEST",
            payload: id,
        };
    }
}

export async function cancelRequest(id) {
    // console.log("Going to cancel id", id);
    const { data } = await axios.post("/api/user/friendBtn.json", {
        task: "Cancel Request",
        friendId: id,
    });
    if (!data.error) {
        return {
            type: "CANCEL_REQUEST",
            payload: id,
        };
    }
}

export async function getUserData(id) {
    // console.log("Going to fetch user data:");
    try {
        const { data } = await axios.get(`/api/user/data.json?id=${id}`);
        return {
            type: "FULL_USER_DATA",
            payload: data,
            id: id,
        };
    } catch (err) {
        console.log("Received an error on /user:", err);
        return {
            type: "FULL_USER_DATA",
            payload: { error: "No Connection to Database" },
            id: id,
        };
    }
}

export async function updateProfilePicture(response) {
    const obj = {
        type: "UPDATE_PROFILE_PICTURE",
    };
    if (response.url) {
        obj.payload = response.url;
    } else {
        obj.profilePicError = response.error;
    }

    return obj;
}

export async function toggleUploadModal() {
    // console.log("Going to fetch user data:");
    return {
        type: "TOGGLE_UPLOAD_MODAL",
    };
}

export async function toggleBioEditor() {
    // console.log("Going to fetch user data:");
    return {
        type: "TOGGLE_BIO_EDITOR",
    };
}

export async function updateBio(bio) {
    // console.log("Going to fetch user data:");

    try {
        const result = await axios.post("/api/profile-bio.json", {
            bio: bio,
        });
        if (result.data.update) {
            return {
                type: "UPDATE_BIO",
                payload: bio,
            };
        } else {
            return {
                type: "UPDATE_BIO",
                payload: { error: result.data.error },
            };
        }
    } catch (err) {
        console.log("there was an error in sending BIO:", err);
        return {
            type: "UPDATE_BIO",
            payload: { error: "Error in Connecting to Server" },
        };
    }
}

export async function submitFriendAction(id, task) {
    // console.log("friend BTN Run (ID, TASK):", id, task);
    try {
        const result = await axios.post("/api/user/friendBtn.json", {
            friendId: id,
            task: task,
        });
        // console.log("result from BTN Action:", result.data);
        return {
            type: "SUBMIT_FRIEND_ACTION",
            payload: {
                text: result.data.text,
                error: !!result.data.error,
            },
        };
    } catch (err) {
        return {
            type: "SUBMIT_FRIEND_ACTION",
            payload: {
                text: false,
                error: true,
            },
        };
    }
}

// receiving a single message
// receiving 10 messages caused my axios on starting <Chat />

export async function receiveChatMessages(user) {
    // console.log("asking server for chat data:");
    const { data } = await axios.get(`api/chat.json?q=${user}`);
    // console.log("data from AXIOS CHAT:", data);
    // const msgs = data.reverse();
    // console.log("FIXME - sorted chat messages:", data);
    if (!data.error) {
        // FIXME analyse messages
        const sorted = analyseMessages(data.reverse());
        // console.log("arr:", data);
        // console.log(Array.isArray(data));
        // sorted = data.reverse();
        // console.log("arr:", sorted);
        return {
            type: "RECEIVE_CHAT_MESSAGES",
            payload: sorted,
        };
    } else {
        return {
            type: "RECEIVE_CHAT_MESSAGES",
            error: data.error,
        };
    }
}

export function newChatMessage(obj) {
    // console.log("Got a new chat msg:", obj);
    return {
        type: "NEW_CHAT_MESSAGE",
        payload: obj,
    };
}

export function activeUsers(arr) {
    //
    // console.log("payload: ", arr);
    return {
        type: "ACTIVE_USERS",
        payload: arr,
    };
}

*/
