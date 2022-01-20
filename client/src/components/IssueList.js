import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "@firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore } from "../firebase";
import AddIssue from "./AddIssue";
import Issue from "./Issue";
import Spinner from "./Spinner";

const IssueList = () => {
  const [issues, setIssues] = useState(null);
  const [search, setSearch] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe;

    const remodelDocs = (docs) => {
      const remodeledDocs = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return remodeledDocs;
    };

    if (!currentUser.admin) {
      setLastDoc(null);
      setFirstDoc(null);

      unsubscribe = onSnapshot(
        query(
          collection(firestore, "issues"),
          where("user.uid", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setIssues(remodelDocs(snapshot.docs))
      );
    } else {
      const getQueryDocs = async (docsQuery) => {
        const queryDocs = await getDocs(docsQuery);

        setFirstDoc(queryDocs.docs[0]);
        setLastDoc(queryDocs.docs[queryDocs.docs.length - 1]);
        setIssues(remodelDocs(queryDocs.docs));
      };

      const docsQuery = query(
        collection(firestore, "issues"),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      getQueryDocs(docsQuery);
    }

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!firstDoc) return;

    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "issues"),
        where("timestamp", ">", firstDoc.data().timestamp),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        setFirstDoc(snapshot.docs[0]);

        setIssues((oldIssues) => [
          ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          ...oldIssues,
        ]);
      }
    );

    return unsubscribe;
  }, [firstDoc]);

  const loadData = async (e) => {
    const buttonText = e.target.innerText;
    e.target.disabled = true;
    e.target.innerText = "Loading...";

    if (!lastDoc) return;

    try {
      const { docs } = await getDocs(
        query(
          collection(firestore, "issues"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc.data().timestamp),
          limit(10)
        )
      );

      const remodeledDocs = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setLastDoc((oldLastDoc) =>
        docs[docs.length - 1] ? docs[docs.length - 1] : oldLastDoc
      );
      setIssues((oldIssues) => [...oldIssues, ...remodeledDocs]);
    } catch (e) {
      console.log(e.message);
      alert("Something went wrong!");
    } finally {
      e.target.disabled = false;
      e.target.innerText = buttonText;
    }
  };

  return !issues ? (
    <div className="center" style={{ height: "80vh" }}>
      <Spinner />
    </div>
  ) : (
    <div className="container">
      <div className="d-flex align-items-center">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="my-3 me-2 flex-fill"
        >
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <AddIssue />
      </div>

      {issues.length === 0 ||
      issues.filter((issue) =>
        issue.issue?.toLowerCase().trim().includes(search.toLowerCase().trim())
      ).length === 0 ? (
        <div className="center" style={{ height: "60vh" }}>
          <p className="fs-2">You haven't posted any issues yet!</p>
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center">
          {issues
            .filter((issue) =>
              issue.issue
                ?.toLowerCase()
                .trim()
                .includes(search.toLowerCase().trim())
            )
            .map((issue) => (
              <Issue
                key={issue.id}
                user={issue.user}
                issue={issue.issue}
                timestamp={issue.timestamp}
                id={issue.id}
                closed={issue.closed}
              />
            ))}

          <button
            className="btn btn-light mb-3"
            style={{ width: "60%" }}
            onClick={loadData}
          >
            Load more issues
          </button>
        </div>
      )}
    </div>
  );
};

export default IssueList;
