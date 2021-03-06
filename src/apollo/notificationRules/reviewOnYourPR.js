import { get } from 'lodash';
import { notificationTypes } from '../../constants';

export default ({
  existingNotifications,
  pullRequest,
  currentUser,
  userSettings,
}) => {
  const newNotifications = [];

  const prAuthor = get(pullRequest, 'author.login');

  if (prAuthor !== currentUser) {
    return newNotifications;
  }

  const hasReviewAlreadyBeenNotified = review =>
    existingNotifications.find(
      notification =>
        notification.type === notificationTypes.REVIEW_ON_YOUR_PR &&
        notification.sourceNodeId === review.id,
    );

  const isReviewByCurrentUser = reviewAuthor => reviewAuthor === currentUser;

  const reviews = get(pullRequest, 'reviews.edges') || [];

  reviews.forEach(({ node }) => {
    const reviewAuthor = get(node, 'author.login');

    if (
      !hasReviewAlreadyBeenNotified(node) &&
      !isReviewByCurrentUser(reviewAuthor)
    ) {
      const message = `${reviewAuthor} reviewed your pull request`;
      const title = 'Review On Your PR';
      const type = notificationTypes.REVIEW_ON_YOUR_PR;

      newNotifications.push({
        type,
        title,
        message,
        sourceNodeId: node.id,
        trigger: get(userSettings, `notifications[${type}].trigger`) || false,
        dismissed: false,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return newNotifications;
};
