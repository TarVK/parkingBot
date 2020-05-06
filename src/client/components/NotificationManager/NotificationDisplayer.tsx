import {jsx} from "@emotion/core";
import {FC} from "react";
import {NotificationManager} from "./NotificationManager";
import {useDataHook} from "model-react";

export const NotificationDisplayer: FC = () => {
    const [h] = useDataHook();
    return (
        <div css={{position: "fixed", left: 16, bottom: 16}}>
            {NotificationManager.getNotifications(h).map(notification => (
                <div key={notification.key as any} css={{marginBottom: 16}}>
                    {notification}
                </div>
            ))}
        </div>
    );
};
