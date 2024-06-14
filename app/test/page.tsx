import User from "@/components/UserModel";
import mongo from "@/components/db";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = cookies();
    const wkey = cookieStore.get("key")?.value;
    const collection = (await mongo()).collection<User>("user");
    const existUser = await collection.findOne({ key: wkey });
    return (
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
        accsesToken: { existUser?.accessToken }
        </p>
    )
}