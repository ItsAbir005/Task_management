// src/socket.js
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
