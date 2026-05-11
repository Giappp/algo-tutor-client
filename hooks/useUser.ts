import useSWR from "swr";
import {AuthUser} from "@/lib/types";
import {fetcher} from "@/api/fetchers";

export function useUser() {
    const {data, error, isLoading, mutate} = useSWR<AuthUser>("/iam/me", fetcher, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    })

    return {
        user: data,
        isLoading,
        isError: error,
        isLoggedIn: !data,
        mutate,
    };
}