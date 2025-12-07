import CicoForm from "../sections/cico-form";
import Header from "../sections/header";

export default function CicoContainer() {
    return (
        <div className="flex flex-col">
            <Header />
            <CicoForm />
        </div>
    )
}
