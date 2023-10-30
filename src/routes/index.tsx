import { useNavigate } from "solid-start";

export default function Base() {
  const navigate = useNavigate();
  navigate("/home");
}