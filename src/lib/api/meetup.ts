import { compareAsc, formatISO, getDate, parseISO, startOfDay } from "date-fns";
import { firebaseApp, firestore } from "lib/firebase";
import {
  insertPreferredDurationToDayTiming,
  convertPreferredDurationToDayTiming,
} from "lib/helpers";
import { MeetingCardProps } from "screens/ViewPlans/MeetingCard/MeetingCard";
import {
  MeetupFields,
  OtherUser,
  ParticipantFields,
  PendingParticipantFields,
  PreferredDuration,
  SuggestionFields,
  UserData,
} from "types/types";
import { DB } from "./dbtypes";

export async function getAllPreferredDurationsFromMeeting(
  meetupId: string
): Promise<PreferredDuration[]> {
  const querySnapShot = await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PARTICIPANTS)
    .get();

  let durations: PreferredDuration[] = [];
  querySnapShot.forEach((doc) => {
    let participantDetails = doc.data() as ParticipantFields;
    participantDetails.preferredDurations.forEach((dur) => {
      durations.push({
        username: participantDetails.username,
        startAt: dur.startAt,
        endAt: dur.endAt,
      });
    });
  });
  return durations;
}
/*
  meetingInfo: MeetupFields;
  participants: ParticipantFields[];
  pendingParticipants: PendingParticipantFields;
  accent?: boolean;
*/

export const getMeetingInfo = async (meetupId: string) => {
  const doc = await firestore.collection("meetups").doc(meetupId).get();
  return doc.data() as MeetupFields;
};

export const getParticipants = async (meetupId: string) => {
  const participants: ParticipantFields[] = [];

  const querySnapshot = await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PARTICIPANTS)
    .get();

  querySnapshot.forEach((doc) => {
    participants.push(doc.data() as ParticipantFields);
  });
  return participants;
};

export const getPendingParticipants = async (meetupId: string) => {
  const pendingParticipants: PendingParticipantFields[] = [];

  const querySnapshot = await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PENDING_PARTICIPANTS)
    .get();

  querySnapshot.forEach((doc) => {
    pendingParticipants.push(doc.data() as PendingParticipantFields);
  });
  return pendingParticipants;
};

export async function getAllMeetingDataForUser(
  userUid: string
): Promise<MeetingCardProps[]> {
  let meetupIds: string[] = [];
  const doc = await firestore.collection("users").doc(userUid).get();
  let userData = doc.data() as UserData;
  userData.meetup_ids?.forEach((meetupId) => {
    meetupIds.push(meetupId);
  });

  if (meetupIds.length === 0) {
    return null;
  }

  let allMeetingData: MeetingCardProps[] = [];

  /*
    {title: "Feb 2021", data: MeetingCardProps[]}

    */
  let meetingInfoPromiseArr: Promise<MeetupFields>[] = [];
  let participantPromiseArr: Promise<ParticipantFields[]>[] = [];
  let pendingParticipantPromiseArr: Promise<PendingParticipantFields[]>[] = [];

  meetupIds.map(async (meetupId) => {
    meetingInfoPromiseArr.push(getMeetingInfo(meetupId));
    participantPromiseArr.push(getParticipants(meetupId));
    pendingParticipantPromiseArr.push(getPendingParticipants(meetupId));

    // const meetingInfo = await getMeetingInfo(meetupId);
    // const participants = await getParticipants(meetupId);
    // const pendingParticipants = await getPendingParticipants(meetupId);

    // allMeetingData.push({
    //   meetingInfo,
    //   participants,
    //   pendingParticipants,
    // });
  });

  const [meetingInfoArr, participantArr, pendingParticipantArr] =
    await Promise.all([
      Promise.all(meetingInfoPromiseArr),
      Promise.all(participantPromiseArr),
      Promise.all(pendingParticipantPromiseArr),
    ]);
  meetingInfoArr.forEach((ele, ind) => {
    allMeetingData.push({
      meetingInfo: ele,
      participants: participantArr[ind],
      pendingParticipants: pendingParticipantArr[ind],
    });
  });
  return allMeetingData;
}

export const getSuggestions = async (meetupId: string) => {
  const snapshot = await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.SUGGESTIONS)
    .get();
  let suggestions: SuggestionFields[] = [];

  snapshot.forEach((doc) => suggestions.push(doc.data() as SuggestionFields));

  // order by ascending date
  suggestions.sort((a, b) =>
    compareAsc(parseISO(a.createdAt), parseISO(b.createdAt))
  );

  return suggestions;
};

export const toggleLike = async (
  meetupId: string,
  suggestionId: string,
  userId: string
) => {
  const doc = firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.SUGGESTIONS)
    .doc(suggestionId);
  const a = await doc.get();
  const oldData = a.data() as SuggestionFields;

  const index = oldData.likedBy.findIndex((e) => e === userId);

  if (index !== -1) {
    oldData.likedBy.splice(index, 1);
  } else {
    oldData.likedBy.push(userId);
  }

  await doc.set(oldData);
};

export const addSuggestion = async (
  meetupId: string,
  userId: string,
  content: string
) => {
  const doc = firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.SUGGESTIONS)
    .doc();

  const newSuggestion: SuggestionFields = {
    createdAt: new Date().toISOString(),
    content: content,
    id: doc.id,
    likedBy: [userId],
    ownerUid: userId,
  };

  await doc.set(newSuggestion);
};

export const getMeetupTimings = async (meetupId: string) => {
  const doc = await firestore.collection(DB.MEETUPS).doc(meetupId).get();
  const { meetupTimings } = doc.data() as MeetupFields;
  // Sort meetup timings by date
  meetupTimings.sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  return meetupTimings;
};

export const getPreferredDurations = async (
  meetupId: string,
  userId: string
) => {
  const doc = await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PARTICIPANTS)
    .doc(userId)
    .get();

  const { preferredDurations } = doc.data() as ParticipantFields;
  return preferredDurations;
};

export const addPreferredDuration = async (
  prefDuration: PreferredDuration,
  meetupId: string,
  userId: string
) => {
  // 1. Add to meetup's meetup timings array
  let query = await firestore.collection(DB.MEETUPS).doc(meetupId).get();
  let { meetupTimings } = query.data() as MeetupFields;
  // 1.a Get the datestring, so we know which dayTiming to change.
  const dateISO = startOfDay(parseISO(prefDuration.startAt)).toISOString();
  const indexToChange = meetupTimings.findIndex((e) => e.date === dateISO);
  let dayTimingToChange = meetupTimings[indexToChange];

  const newDayTiming = insertPreferredDurationToDayTiming(
    prefDuration,
    dayTimingToChange
  );

  meetupTimings[indexToChange] = newDayTiming;
  await firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .update({ meetupTimings: meetupTimings });

  // 2. Add to meetup's participants preferred durations
  let query2 = firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PARTICIPANTS)
    .doc(userId)
    .update({
      preferredDurations:
        firebaseApp.firestore.FieldValue.arrayUnion(prefDuration),
    });
};

export const deletePreferredDuration = async (
  prefDuration: PreferredDuration,
  meetupId: string,
  userId: string
) => {
  // TODO
  return;
};

export const createMeetup = async (
  meetupDetails: MeetupFields,
  selectedUsers: OtherUser[],
  currentUser: UserData
) => {
  const meetupId = meetupDetails.id;
  const meetupDoc = firestore.collection(DB.MEETUPS).doc(meetupId);

  // Basic fields in meetup
  await meetupDoc.set(meetupDetails);

  // Add Pending Participants to meetup
  selectedUsers.forEach(async (pal) => {
    await meetupDoc
      .collection(DB.PENDING_PARTICIPANTS)
      .doc(pal.uid)
      .set({
        requestedAt: new Date().toISOString(),
        username: pal.username,
        url_thumbnail: pal.url_thumbnail,
      } as PendingParticipantFields);
  });

  // Add user as participant
  await meetupDoc
    .collection(DB.PARTICIPANTS)
    .doc(currentUser.uid)
    .set({
      isHost: true,
      preferredDurations: [],
      url_thumbnail: currentUser.url_thumbnail,
      username: currentUser.username,
    } as ParticipantFields);

  // Add meetup id to user's data
  await firestore
    .collection(DB.USERS)
    .doc(currentUser.uid)
    .update({
      meetup_ids: firebaseApp.firestore.FieldValue.arrayUnion(meetupId),
    });
};

export const addUsersToMeetup = (users: OtherUser[], meetupId: string) => {
  // Add to pending participants
  let batch = firestore.batch();
  let collection = firestore
    .collection(DB.MEETUPS)
    .doc(meetupId)
    .collection(DB.PENDING_PARTICIPANTS);

  users.forEach((user) => {
    let doc = collection.doc(user.uid);
    batch.set(doc, {
      requestedAt: new Date().toISOString(),
      uid: user.uid,
      url_thumbnail: user.url_thumbnail,
      username: user.username,
    } as PendingParticipantFields);
  });

  batch.commit();
};
