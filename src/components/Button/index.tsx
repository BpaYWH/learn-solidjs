import type { JSX } from "solid-js";
import { splitProps } from "solid-js";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
   // title: string;
   style?: string;
}

const styles: {[key: string]: string} = {
   "general": "px-4 py-2 border rounded-md hover:bg-slate-400 hover:text-white transition"
};

export default function Button(props: ButtonProps): JSX.Element {
   const [local, buttonProps] = splitProps(props, ["title", "style"]);
   // if (!local.style) local.style = "general";

   return (
      <button
      {...buttonProps}
      class={styles[local.style ?? "general"]}
      >
      {buttonProps.children}
      </button>
   );
};