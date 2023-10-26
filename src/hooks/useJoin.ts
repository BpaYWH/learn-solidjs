import { createSignal, onCleanup, onMount } from "solid-js";
import * as signalR from "@microsoft/signalr";

export default function useJoin() {
   const [socket, setSocket] = createSignal<signalR.HubConnection>();
   const [msg, setMsg] = createSignal<string>("");

   onMount(() => {
      const ws = new signalR.HubConnectionBuilder().withUrl("http://localhost:5095/gameHub").build();
      setSocket(ws);
      
      ws.on("PlayerConnected", (message: string) => {
         setMsg(message);
      });
      ws.on("messageReceived", (message: string) => {
         setMsg(message);
      });
      ws.start();

   });

   onCleanup(() => {
      socket()?.stop();
   });

   return {
      socket,
      msg
   };
}