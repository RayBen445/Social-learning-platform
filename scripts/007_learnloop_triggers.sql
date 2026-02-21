-- LearnLoop Database Triggers and Helper Functions

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    status,
    is_verified,
    verification_type
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'online',
    FALSE,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Update profile counters when post is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_posts = total_posts + 1
  WHERE id = NEW.user_id;
  
  UPDATE public.topics
  SET post_count = post_count + 1
  WHERE id IN (SELECT topic_id FROM public.post_topics WHERE post_id = NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_count();

-- =====================================================
-- TRIGGER: Update profile counters when post is deleted
-- =====================================================
CREATE OR REPLACE FUNCTION public.decrement_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_posts = GREATEST(total_posts - 1, 0)
  WHERE id = OLD.user_id;
  
  UPDATE public.topics
  SET post_count = GREATEST(post_count - 1, 0)
  WHERE id IN (SELECT topic_id FROM public.post_topics WHERE post_id = OLD.id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_deleted ON public.posts;
CREATE TRIGGER on_post_deleted
  AFTER DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_post_count();

-- =====================================================
-- TRIGGER: Update counters when comment is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_comments = total_comments + 1
  WHERE id = NEW.user_id;
  
  UPDATE public.posts
  SET comment_count = comment_count + 1
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comment_count();

-- =====================================================
-- TRIGGER: Update counters when comment is deleted
-- =====================================================
CREATE OR REPLACE FUNCTION public.decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_comments = GREATEST(total_comments - 1, 0)
  WHERE id = OLD.user_id;
  
  UPDATE public.posts
  SET comment_count = GREATEST(comment_count - 1, 0)
  WHERE id = OLD.post_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comment_count();

-- =====================================================
-- TRIGGER: Update vote counts when post vote is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_post_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'upvote' THEN
    UPDATE public.posts
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.post_id;
  ELSIF NEW.vote_type = 'downvote' THEN
    UPDATE public.posts
    SET downvote_count = downvote_count + 1
    WHERE id = NEW.post_id;
  END IF;
  
  -- Award reputation points
  UPDATE public.profiles
  SET reputation_points = reputation_points + CASE 
    WHEN NEW.vote_type = 'upvote' THEN 5
    WHEN NEW.vote_type = 'downvote' THEN -2
    ELSE 0
  END
  WHERE id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_vote_created ON public.post_votes;
CREATE TRIGGER on_post_vote_created
  AFTER INSERT ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_vote_count();

-- =====================================================
-- TRIGGER: Update vote counts when post vote is deleted
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_post_vote_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.vote_type = 'upvote' THEN
    UPDATE public.posts
    SET upvote_count = GREATEST(upvote_count - 1, 0)
    WHERE id = OLD.post_id;
  ELSIF OLD.vote_type = 'downvote' THEN
    UPDATE public.posts
    SET downvote_count = GREATEST(downvote_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_vote_deleted ON public.post_votes;
CREATE TRIGGER on_post_vote_deleted
  AFTER DELETE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_vote_delete();

-- =====================================================
-- TRIGGER: Update follow counts
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_follow_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_followers = total_followers + 1
  WHERE id = NEW.following_id;
  
  UPDATE public.profiles
  SET total_following = total_following + 1
  WHERE id = NEW.follower_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_count();

-- =====================================================
-- TRIGGER: Update follow counts on unfollow
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_follow_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_followers = GREATEST(total_followers - 1, 0)
  WHERE id = OLD.following_id;
  
  UPDATE public.profiles
  SET total_following = GREATEST(total_following - 1, 0)
  WHERE id = OLD.follower_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_follow_deleted ON public.follows;
CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_count_delete();

-- =====================================================
-- TRIGGER: Update topic subscription count
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_topic_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.topics
  SET subscriber_count = subscriber_count + 1
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_topic_subscription_created ON public.topic_subscriptions;
CREATE TRIGGER on_topic_subscription_created
  AFTER INSERT ON public.topic_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_topic_subscriber_count();

-- =====================================================
-- TRIGGER: Decrement topic subscription count
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_topic_subscriber_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.topics
  SET subscriber_count = GREATEST(subscriber_count - 1, 0)
  WHERE id = OLD.topic_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_topic_subscription_deleted ON public.topic_subscriptions;
CREATE TRIGGER on_topic_subscription_deleted
  AFTER DELETE ON public.topic_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_topic_subscriber_count_delete();
