"use client";
import { useRef } from "react";
import { Trash } from "lucide-react";
import { toast } from "@/components/ui/toast";


type OdstraneniSkupinyProps = {
    groupId: string;
    groupName: string;
    isOwner: boolean;
    onDeleted?: () => void;  //callback zavolaný po úspěšném odstraněním, třeba k přesměrování
};


export default function OdstraneniSkupiny({ groupName, isOwner, }: OdstraneniSkupinyProps) {

    const dialogRef = useRef<HTMLDialogElement>(null);


    function openDialog() {
        dialogRef.current?.showModal();
    }
    function closeDialog() {
        dialogRef.current?.close();
    }

    async function handleDelete() {

        const simulateSuccess = false; //prozatimní simulace odpovědi backendu, později smazat

        try {
            if (!simulateSuccess) {
                throw new Error("Simulated deletion failure");
            }

            closeDialog();

            toast.add({
                type: "success",
                title: "Skupina byla úspěšně odstraněna.",
            });

        } catch {
            closeDialog();

            toast.add({
                type: "error",
                title: "Odstranění skupiny se nezdařilo.",
                description: "Zkuste to prosím znovu.",
            });
        }
    }

    if (!isOwner) { //pokud uživatel není vlastník skupiny, nezobrazovat komponentu
        return null;
    }


    return (
        <>
            {/* Delete tlačítko */}
            <button
                type="button"
                className=" bg-red-200 px-3 py-2 text-red-600 rounded-xl border border-red-600 font-bold inline-flex items-center gap-2"
                onClick={openDialog}
            >
                <Trash size={20} />
                Odstranit skupinu
            </button>

            {/* potvrzovací dialog okno */}
            <dialog
                ref={dialogRef}
                className="m-auto w-[90%] max-w-sm rounded-xl bg-white p-4 text-gray-900 shadow-xl backdrop:bg-black/60">

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <Trash size={24} color="#dc2626" />
                    </div>

                    <h2 className="text-lg font-bold">
                        Odstranit skupinu?
                    </h2>

                    <button
                        type="button"
                        onClick={closeDialog}
                        className="ml-auto font-bold text-2xl text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <p className="my-4 text-sm">
                    Opravdu chcete odstranit skupinu &quot;{groupName}&quot;? Tuto akci nelze vrátit zpět.
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={closeDialog}
                        className="rounded-xl border border-gray-400 px-4 py-2 bg-gray-200 font-bold"
                    >
                        Zrušit
                    </button>

                    <button
                        type="button"
                        className="rounded-xl bg-red-600 px-4 py-2 text-white font-bold"
                        onClick={handleDelete}
                    >
                        Odstranit
                    </button>
                </div>
            </dialog>
        </>
    );
}