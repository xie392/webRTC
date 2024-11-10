import { users } from "../data/users";

function SelectUser({ onSelect }: { onSelect: (userId: string) => void }) {
  return (
    <div className="bg-black/10 h-screen w-full flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-96 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">请选择一个用户</h1>
        <div className="overflow-auto flex-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center mb-2 border-b last-of-type:border-none py-2 hover:bg-slate-200 rounded cursor-pointer px-4"
              onClick={() => onSelect(user.id)}
            >
              <span className="text-gray-700">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectUser;
