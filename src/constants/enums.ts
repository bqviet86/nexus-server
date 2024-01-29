export enum UserRole {
    Admin = 'admin',
    User = 'user'
}

export enum Sex {
    Male = 'male',
    Female = 'female'
}

export enum TokenTypes {
    AccessToken = 'access_token',
    RefreshToken = 'refresh_token'
}

export enum MediaTypes {
    Image = 'image',
    Video = 'video'
}

export enum VideoEncodingStatus {
    Pending = 'pending',
    Processing = 'processing',
    Success = 'success',
    Failed = 'failed'
}

export enum PostType {
    Post = 'post',
    Share = 'share'
}

export enum NotificationType {
    Post = 'post',
    Friend = 'friend'
}

export enum NotificationPostAction {
    Like = 'like',
    Comment = 'comment',
    Share = 'share',
    HandlePostSuccess = 'handle_post_success'
}

export enum NotificationFriendAction {
    NewFriendRequest = 'new_friend_request',
    AcceptFriendRequest = 'accept_friend_request'
}

export enum NotificationTag {
    All = 'all',
    Read = 'read',
    Unread = 'unread'
}

export enum FriendStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Declined = 'declined'
}
