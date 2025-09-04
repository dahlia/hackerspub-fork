import { unescape } from "es-toolkit/string";
import { graphql } from "relay-runtime";
import type { JSX } from "solid-js";
import { For, Match, Show, Switch } from "solid-js";
import { createFragment } from "solid-relay";
import { NotificationActor } from "~/components/NotificationActor.tsx";
import { Trans } from "~/components/Trans.tsx";
import { Avatar, AvatarImage } from "~/components/ui/avatar.tsx";
import type { NotificationMessage_notification$key } from "./__generated__/NotificationMessage_notification.graphql.ts";
import type { NotificationMessageActorAvatars_notification$key } from "./__generated__/NotificationMessageActorAvatars_notification.graphql.ts";

interface NotificationMessageProps {
  singleActorMessage: string;
  multipleActorMessage: string;
  $notification: NotificationMessage_notification$key;
  additionalValues?: Record<string, () => JSX.Element>;
}

/**
 * Generic notification message renderer.
 *
 * @example Basic usage (e.g., Mention)
 * <NotificationMessage
 *   singleActorMessage={t`${"ACTOR"} mentioned you`}
 *   multipleActorMessage={t`${"ACTOR"} and ${"COUNT"} others mentioned you`}
 *   $notification={notification()}
 * />
 *
 * @example Extra placeholder (e.g., React)
 * <NotificationMessage
 *   singleActorMessage={t`${"ACTOR"} reacted to your post with ${"EMOJI"}`}
 *   multipleActorMessage={t`${"ACTOR"} and ${"COUNT"} others reacted to your post with ${"EMOJI"}`}
 *   $notification={notification()}
 *   additionalValues={{ EMOJI: () => emojiElement() }}
 * />
 */
export function NotificationMessage(props: NotificationMessageProps) {
  const notification = createFragment(
    graphql`
      fragment NotificationMessage_notification on Notification {
        actors {
          edges {
            __typename
          }
        }
        ...NotificationMessageActorAvatars_notification
        ...NotificationActor_notification
      }
    `,
    () => props.$notification,
  );

  return (
    <Show when={notification()}>
      {(notification) => (
        <div class="flex flex-row">
          <NotificationMessageActorAvatars $notification={notification()} />
          <Switch>
            <Match when={notification().actors.edges.length === 1}>
              <div>
                <Trans
                  message={props.singleActorMessage}
                  values={{
                    ACTOR: () => (
                      <NotificationActor $notification={notification()} />
                    ),
                    ...props.additionalValues,
                  }}
                />
              </div>
            </Match>
            <Match when={notification().actors.edges.length > 1}>
              <div>
                <Trans
                  message={props.multipleActorMessage}
                  values={{
                    ACTOR: () => (
                      <NotificationActor $notification={notification()} />
                    ),
                    COUNT: () => notification().actors.edges.length - 1,
                    ...props.additionalValues,
                  }}
                />
              </div>
            </Match>
          </Switch>
        </div>
      )}
    </Show>
  );
}

interface NotificationMessageActorAvatarsProps {
  $notification: NotificationMessageActorAvatars_notification$key;
}

function NotificationMessageActorAvatars(
  props: NotificationMessageActorAvatarsProps,
) {
  const noti = createFragment(
    graphql`
      fragment NotificationMessageActorAvatars_notification on Notification {
        actors {
          edges {
            node {
              avatarUrl
              handle
              username
              local
              name
            }
          }
        }
      }
    `,
    () => props.$notification,
  );

  return (
    <Show when={noti()}>
      {(noti) => (
        <For each={noti().actors.edges}>
          {({ node }) => (
            <Avatar>
              <AvatarImage
                src={node.avatarUrl}
                alt={unescape(node.name ?? "")}
              />
            </Avatar>
          )}
        </For>
      )}
    </Show>
  );
}
