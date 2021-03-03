import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    acceptRequest,
    cancelRequest,
    denyRequest,
    getFriendships,
    unfriend,
} from "../helpers/actions";
import Finder from "./Finder";

export default function Social() {
    const dispatch = useDispatch();
    const all = useSelector((store) => store.friendships);

    useEffect(() => {
        dispatch(getFriendships());
    }, []);

    let friends = <div>There are none</div>;
    let requests;
    let pending;
    let error;

    if (!all) {
        // console.log("exiting");
        return null;
    } else if (all.error) {
        console.log("We hit an error:", all.error);
        error = all.error;
    } else if (all.length > 0) {
        friends = all.filter((elem) => elem.confirmed);
        requests = all.filter(
            (elem) => !elem.confirmed && elem.sender == elem.id
        );
        pending = all.filter(
            (elem) => !elem.confirmed && elem.recipient == elem.id
        );

        if (!friends.length) {
            friends = <div>There are none</div>;
        } else {
            friends = friends.map((elem, i) => (
                <Link key={i} to={`/user/${elem.id}`}>
                    <div className="card small wide-small split">
                        <div className="card-left">
                            <img src={elem.picture || "/default.svg"} />
                        </div>
                        <div className="card-right">
                            <div>
                                <h4>
                                    {elem.first} {elem.last}
                                </h4>
                            </div>
                            <div className="summary">Trips friends Matches</div>
                        </div>
                    </div>
                </Link>
            ));
        }

        if (!requests.length) {
            requests = <div>There are none</div>;
        } else {
            requests = requests.map((elem, i) => (
                <div key={i} className="found-friend">
                    <div className="friend-pic-small">
                        <img src={elem.picture || "/default.svg"} />
                    </div>
                    <div className="friend-summary">
                        <div className="friend-name">
                            <h4>
                                {elem.first} {elem.last}
                            </h4>
                        </div>
                    </div>
                    <div className="friend-function">
                        <Link to={`/user/${elem.id}`}>
                            <img src="/arrow_black.png" />
                        </Link>
                    </div>
                </div>
            ));
        }
        if (!pending.length) {
            pending = <div>There are none</div>;
        } else {
            pending = pending.map((elem, i) => (
                <div key={i} className="found-friend">
                    <div className="friend-pic-small">
                        <img src={elem.picture || "/default.svg"} />
                    </div>
                    <div className="friend-summary">
                        <div className="friend-name">
                            <h4>
                                {elem.first} {elem.last}
                            </h4>
                        </div>
                    </div>
                    <div className="friend-function">
                        <Link to={`/user/${elem.id}`}>
                            <img src="/arrow_black.png" />
                        </Link>
                    </div>
                </div>
            ));
        }
    }

    return (
        <div className="central social">
            <h1>Your Friends</h1>
            <div className="container-frame">
                <div className="card-container inprofile horizontal">
                    {friends}
                </div>
            </div>
            <h1>Grow your Community</h1>
            <div className="grow-split">
                <div>
                    <h3>Friend-Requests to you</h3>
                    <div className="container-frame">
                        <div className="card-container inprofile horizontal">
                            {requests}
                        </div>
                    </div>
                </div>

                <div>
                    <h3>Friend-Request from you</h3>
                    <div className="container-frame">
                        <div className="card-container inprofile horizontal">
                            {pending}
                        </div>
                    </div>
                </div>

                <Finder />
            </div>
        </div>
    );
}
