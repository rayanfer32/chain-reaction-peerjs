
export default function Button(props) {
  return (
    <button className="bg-blue-500 w-fit p-2" {...props}>
      {props.children}
    </button>
  );
}
