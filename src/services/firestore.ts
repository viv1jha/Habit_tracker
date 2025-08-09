import { db } from '../firebase'
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import type { Task, Habit } from '../types'

export function tasksCollectionPath(uid: string) {
  return collection(db, 'users', uid, 'tasks')
}
export function habitsCollectionPath(uid: string) {
  return collection(db, 'users', uid, 'habits')
}

export function subscribeTasks(uid: string, cb: (tasks: Task[]) => void) {
  const q = query(tasksCollectionPath(uid), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => {
    const list: Task[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }))
    cb(list)
  })
}
export function subscribeHabits(uid: string, cb: (habits: Habit[]) => void) {
  const q = query(habitsCollectionPath(uid), orderBy('startDate', 'desc'))
  return onSnapshot(q, (snap) => {
    const list: Habit[] = []
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Habit, 'id'>) }))
    cb(list)
  })
}

export async function addTask(uid: string, task: Omit<Task, 'id'>) {
  await addDoc(tasksCollectionPath(uid), task)
}
export async function updateTask(uid: string, id: string, updates: Partial<Task>) {
  await updateDoc(doc(tasksCollectionPath(uid), id), updates as any)
}
export async function deleteTaskDoc(uid: string, id: string) {
  await deleteDoc(doc(tasksCollectionPath(uid), id))
}

export async function addHabit(uid: string, habit: Omit<Habit, 'id'>) {
  await addDoc(habitsCollectionPath(uid), habit)
}
export async function updateHabit(uid: string, id: string, updates: Partial<Habit>) {
  await updateDoc(doc(habitsCollectionPath(uid), id), updates as any)
}
export async function deleteHabitDoc(uid: string, id: string) {
  await deleteDoc(doc(habitsCollectionPath(uid), id))
}
