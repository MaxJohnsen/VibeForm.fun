CREATE OR REPLACE FUNCTION public.get_form_stats(p_form_ids uuid[])
 RETURNS TABLE(form_id uuid, response_count bigint, completed_count bigint, question_count bigint, integration_count bigint, last_response_at timestamp with time zone, weekly_responses bigint[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  week_start TIMESTAMPTZ;
BEGIN
  week_start := date_trunc('week', now()) - interval '6 weeks';
  
  RETURN QUERY
  WITH form_responses AS (
    SELECT 
      r.form_id,
      COUNT(*) AS total_responses,
      COUNT(*) FILTER (WHERE r.status = 'completed') AS total_completed,
      MAX(r.started_at) AS last_response
    FROM responses r
    WHERE r.form_id = ANY(p_form_ids)
    GROUP BY r.form_id
  ),
  form_questions AS (
    SELECT 
      q.form_id,
      COUNT(*) AS total_questions
    FROM questions q
    WHERE q.form_id = ANY(p_form_ids)
    GROUP BY q.form_id
  ),
  form_integrations AS (
    SELECT 
      fi.form_id,
      COUNT(*) AS total_integrations
    FROM form_integrations fi
    WHERE fi.form_id = ANY(p_form_ids)
    GROUP BY fi.form_id
  ),
  weekly_data AS (
    SELECT 
      r.form_id,
      date_trunc('week', r.started_at) AS week,
      COUNT(*) AS week_count
    FROM responses r
    WHERE r.form_id = ANY(p_form_ids)
      AND r.started_at >= week_start
    GROUP BY r.form_id, date_trunc('week', r.started_at)
  ),
  weeks AS (
    SELECT generate_series(
      date_trunc('week', now()) - interval '6 weeks',
      date_trunc('week', now()),
      interval '1 week'
    ) AS week
  ),
  weekly_aggregated AS (
    SELECT 
      f.id AS form_id,
      ARRAY_AGG(COALESCE(wd.week_count, 0) ORDER BY w.week) AS weekly_arr
    FROM unnest(p_form_ids) AS f(id)
    CROSS JOIN weeks w
    LEFT JOIN weekly_data wd ON wd.form_id = f.id AND wd.week = w.week
    GROUP BY f.id
  )
  SELECT 
    f.id AS form_id,
    COALESCE(fr.total_responses, 0)::BIGINT AS response_count,
    COALESCE(fr.total_completed, 0)::BIGINT AS completed_count,
    COALESCE(fq.total_questions, 0)::BIGINT AS question_count,
    COALESCE(fi.total_integrations, 0)::BIGINT AS integration_count,
    fr.last_response AS last_response_at,
    COALESCE(wa.weekly_arr, ARRAY[0,0,0,0,0,0,0]::BIGINT[]) AS weekly_responses
  FROM unnest(p_form_ids) AS f(id)
  LEFT JOIN form_responses fr ON fr.form_id = f.id
  LEFT JOIN form_questions fq ON fq.form_id = f.id
  LEFT JOIN form_integrations fi ON fi.form_id = f.id
  LEFT JOIN weekly_aggregated wa ON wa.form_id = f.id;
END;
$function$;