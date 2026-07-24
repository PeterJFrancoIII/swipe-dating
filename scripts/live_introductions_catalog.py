"""Immutable UX catalog for the synthetic Live Introductions prototype.

This standard-library-only module is design input for a later static generator.
It is deliberately separate from the product runtime and implements no product
capability.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from enum import Enum
from types import MappingProxyType

ATLAS_TARGET = "@atlas"
EXTERNAL_CAPTURE_COPY = (
    "This concept does not record, but it cannot prevent or erase "
    "operating-system screenshots, operating-system screen recordings, "
    "or another device filming the screen."
)


class Role(str, Enum):
    """A perspective represented by a directly addressable frame."""

    VIEWER = "viewer"
    FEATURED_PARTICIPANT = "featured_participant"
    FACILITATOR = "facilitator"
    CROSS_ROLE = "cross_role"


PRODUCT_ROLES = frozenset(
    {
        Role.VIEWER,
        Role.FEATURED_PARTICIPANT,
        Role.FACILITATOR,
    }
)
PARTICIPANT_ROLES = frozenset(
    {
        Role.VIEWER,
        Role.FEATURED_PARTICIPANT,
    }
)


class Phase(str, Enum):
    """The UX phase in which a frame appears."""

    RESEARCH = "research"
    ELIGIBILITY = "eligibility"
    PREFERENCES = "preferences"
    INVITATION = "invitation"
    BRIEFING = "briefing"
    LOBBY = "lobby"
    LIVE = "live"
    REFLECTION = "reflection"
    INTEREST = "interest"
    CONNECTION = "connection"
    MEETING = "meeting"
    PREPARATION = "preparation"
    DISCOVERY = "discovery"
    FACILITATION = "facilitation"
    TERMINAL = "terminal"
    SAFETY = "safety"


class TerminalClass(str, Enum):
    """Whether, and why, a frame closes a Live-derived path."""

    NON_TERMINAL = "non_terminal"
    NORMAL_COMPLETION = "normal_completion"
    SAFETY_TERMINATION = "safety_termination"
    NEUTRAL_CLOSURE = "neutral_closure"
    INTEGRITY_CLOSURE = "integrity_closure"
    NEUTRAL_OUTCOME = "neutral_outcome"
    FEATURE_HIDDEN = "feature_hidden"


class ContinuationClass(str, Enum):
    """The kind of continuation a frame may expose."""

    STANDARD_FLOW = "standard_flow"
    NORMAL_COMPLETION_ONLY = "normal_completion_only"
    MUTUAL_CHOICE_ONLY = "mutual_choice_only"
    NO_LIVE_CONTINUATION = "no_live_continuation"


class TransitionKind(str, Enum):
    """Who controls a transition, or whether it is review-only."""

    USER = "user"
    FACILITATOR = "facilitator"
    SYSTEM = "system"
    REVIEW = "review"


class ActionIntent(str, Enum):
    """Whether a static transition is navigation or only a truthful preview."""

    NAVIGATION = "navigation"
    PROTOTYPE_CONTROL = "prototype_control"
    SYSTEM_OUTCOME = "system_outcome"
    REVIEW_EDGE = "review_edge"


class ActionScope(str, Enum):
    """What a control affects when provenance constrains continuation."""

    ORDINARY = "ordinary"
    SAFETY = "safety"
    CLOSURE_REFLECTION = "closure_reflection"
    LIVE_DERIVED_CONTINUATION = "live_derived_continuation"


class ShellActionKind(str, Enum):
    """A stable position in the persistent prototype shell."""

    STATUS = "status"
    NAVIGATION = "navigation"
    SAFETY = "safety"
    WITHDRAWAL = "withdrawal"


class TerminalResolutionCondition(str, Enum):
    """Mutually exclusive fixed-end conditions in strict resolution order."""

    FACILITATOR_SAFETY_COMMITTED = "facilitator_safety_committed"
    UNRESOLVED_SAFETY_OR_INTEGRITY = "unresolved_safety_or_integrity"
    KNOWN_NEUTRAL = "known_neutral"
    HEALTHY_NORMAL = "healthy_normal"


class TransitionGuard(str, Enum):
    """A visible condition that must hold before following an action."""

    ALWAYS = "always"
    PREVIEW_ENTERED = "preview_entered"
    CONSENT_ACKNOWLEDGED = "consent_acknowledged"
    ADULT_ELIGIBLE = "adult_eligible"
    CIRCLE_CONFIRMED = "circle_confirmed"
    TRAINING_COMPLETE = "training_complete"
    VALID_ARMED_START = "valid_armed_start"
    NORMAL_COMPLETION_ONLY = "normal_completion_only"
    VIEWER_SPARK_SENT = "viewer_spark_sent"
    ADEQUATE_MIXING = "adequate_mixing"
    MUTUAL_INTEREST = "mutual_interest"
    MUTUAL_INTEREST_NOT_CONFIRMED = "mutual_interest_not_confirmed"
    MUTUAL_TEXT_PERMISSION = "mutual_text_permission"
    DELIBERATE_REVALIDATION = "deliberate_revalidation"
    MUTUAL_READINESS_REVALIDATED = "mutual_readiness_revalidated"
    MUTUAL_READINESS_NOT_CONFIRMED = "mutual_readiness_not_confirmed"
    RETURN_NAVIGATION = "return_navigation"
    MARA_CONFIRMED_SAFETY = "mara_confirmed_safety"
    KNOWN_NEUTRAL_TRIGGER = "known_neutral_trigger"
    HEALTHY_FIXED_END = "healthy_fixed_end"
    FAIL_CLOSED = "fail_closed"


class SurfaceKind(str, Enum):
    """A distinct product-native surface rendered for one catalog frame."""

    VIEWER_CONSENT = "viewer_consent"
    VIEWER_ADULT_STATUS = "viewer_adult_status"
    VIEWER_PREFERENCES = "viewer_preferences"
    VIEWER_INVITATIONS = "viewer_invitations"
    VIEWER_INVITATION_DETAIL = "viewer_invitation_detail"
    VIEWER_BRIEFING = "viewer_briefing"
    VIEWER_LOBBY = "viewer_lobby"
    VIEWER_LIVE_ROOM = "viewer_live_room"
    VIEWER_SAFETY_CLARIFICATION = "viewer_safety_clarification"
    VIEWER_TOPIC_CHOICE = "viewer_topic_choice"
    VIEWER_QUESTION = "viewer_question"
    VIEWER_DEBRIEF = "viewer_debrief"
    VIEWER_SPARK = "viewer_spark"
    VIEWER_SPARK_SEALED = "viewer_spark_sealed"
    VIEWER_RECIPROCAL_OUTCOME = "viewer_reciprocal_outcome"
    VIEWER_NO_OUTCOME = "viewer_no_outcome"
    VIEWER_CONNECTION_PERMISSION = "viewer_connection_permission"
    VIEWER_CONVERSATION = "viewer_conversation"
    VIEWER_MEETING_READINESS = "viewer_meeting_readiness"
    VIEWER_MEETING_PLAN = "viewer_meeting_plan"
    FEATURED_VERIFICATION = "featured_verification"
    FEATURED_TRAINING = "featured_training"
    FEATURED_REHEARSAL = "featured_rehearsal"
    FEATURED_GREENROOM = "featured_greenroom"
    FEATURED_LIVE_ROOM = "featured_live_room"
    FEATURED_REFLECTION = "featured_reflection"
    FEATURED_CANDIDATE_PROFILE = "featured_candidate_profile"
    FEATURED_CONNECTION = "featured_connection"
    FACILITATOR_ASSIGNMENT = "facilitator_assignment"
    FACILITATOR_READINESS = "facilitator_readiness"
    FACILITATOR_CONSOLE = "facilitator_console"
    FACILITATOR_INCIDENT = "facilitator_incident"
    FACILITATOR_PAUSE = "facilitator_pause"
    FACILITATOR_COMPLETION = "facilitator_completion"
    FACILITATOR_TERMINATION = "facilitator_termination"
    FACILITATOR_NEUTRAL_CLOSURE = "facilitator_neutral_closure"
    INTEGRITY_CLOSURE = "integrity_closure"
    SAFETY_REPORT = "safety_report"
    SAFETY_REPORT_VIEWER = "safety_report_viewer"
    SAFETY_REPORT_FEATURED = "safety_report_featured"
    SAFETY_REPORT_FACILITATOR = "safety_report_facilitator"
    HIDE_LIVE = "hide_live"


class SafetyReportDestination(str, Enum):
    """Direct static report-preview destinations scoped to one product role."""

    VIEWER = "S02-VIEWER"
    FEATURED = "S02-FEATURED"
    FACILITATOR = "S02-FACILITATOR"


_SAFETY_REPORT_TARGET_BY_ROLE = MappingProxyType(
    {
        Role.VIEWER: SafetyReportDestination.VIEWER.value,
        Role.FEATURED_PARTICIPANT: SafetyReportDestination.FEATURED.value,
        Role.FACILITATOR: SafetyReportDestination.FACILITATOR.value,
    }
)


class SurfaceContext(str, Enum):
    """The privacy/provenance context governing presentation and controls."""

    STUDY_ENTRY = "study_entry"
    LIVE_ROOM = "live_room"
    PRIVATE_POST_ROOM = "private_post_room"
    NORMAL_COMPLETION = "normal_completion"
    ORDINARY_APP = "ordinary_app"
    FACILITATOR = "facilitator"
    SAFETY = "safety"
    NO_LIVE_CONTINUATION = "no_live_continuation"


class ChoiceInputKind(str, Enum):
    """Native static choice-control semantics."""

    RADIO = "radio"
    CHECKBOX = "checkbox"


@dataclass(frozen=True, slots=True)
class ChoiceOptionData:
    value: str
    label: str
    detail: str = ""
    selected: bool = False


@dataclass(frozen=True, slots=True)
class ChoiceGroupData:
    legend: str
    input_kind: ChoiceInputKind
    options: tuple[ChoiceOptionData, ...]


@dataclass(frozen=True, slots=True)
class StatusData:
    label: str
    value: str
    current: bool = False


@dataclass(frozen=True, slots=True)
class PanelData:
    heading: str
    body: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class ProfileData:
    name: str
    subtitle: str
    facts: tuple[str, ...]
    bio: str


@dataclass(frozen=True, slots=True)
class ConversationMessageData:
    speaker: str
    body: str
    timestamp: str = ""


@dataclass(frozen=True, slots=True)
class ConversationData:
    label: str
    messages: tuple[ConversationMessageData, ...]
    segments: tuple[str, ...] = ()
    current_segment: int | None = None


@dataclass(frozen=True, slots=True)
class TextControlData:
    label: str
    value: str
    multiline: bool = False


@dataclass(frozen=True, slots=True)
class EvidenceOptionData:
    value: str
    label: str
    selected: bool = False


@dataclass(frozen=True, slots=True)
class EvidenceData:
    legend: str
    options: tuple[EvidenceOptionData, ...]


@dataclass(frozen=True, slots=True)
class ContractData:
    privacy: str
    accessibility: str
    failure_exit: str


@dataclass(frozen=True, slots=True)
class SurfacePresentation:
    """Typed, product-specific presentation metadata for one frame."""

    kind: SurfaceKind
    context: SurfaceContext
    audience: Role
    brand_label: str
    eyebrow: str
    heading: str
    summary: str
    statuses: tuple[StatusData, ...]
    panels: tuple[PanelData, ...]
    current_shell: ShellAction | None = None
    control_audiences: tuple[Role, ...] = ()
    choice_groups: tuple[ChoiceGroupData, ...] = ()
    profile: ProfileData | None = None
    conversation: ConversationData | None = None
    text_controls: tuple[TextControlData, ...] = ()
    evidence: EvidenceData | None = None
    contract: ContractData | None = None


@dataclass(frozen=True, slots=True)
class ContentBlock:
    """A renderable editorial block."""

    heading: str
    body: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class AudienceDestination:
    """One audience-specific destination for a shared static action."""

    audience: Role
    target_id: str

    def __post_init__(self) -> None:
        if self.audience not in PRODUCT_ROLES:
            raise ValueError("Audience destinations require an actual product role")
        if not self.target_id:
            raise ValueError("Audience destinations require a target")


@dataclass(frozen=True, slots=True)
class Action:
    """A typed transition and its declared destination."""

    label: str
    target_id: str
    audience: Role | None
    kind: TransitionKind
    intent: ActionIntent
    guard: TransitionGuard = TransitionGuard.ALWAYS
    audiences: frozenset[Role] = frozenset()
    scope: ActionScope = ActionScope.ORDINARY
    destinations: tuple[AudienceDestination, ...] = ()

    def __post_init__(self) -> None:
        if self.audiences:
            resolved = self.audiences
        elif self.audience is Role.CROSS_ROLE:
            resolved = PRODUCT_ROLES
        elif self.audience in PRODUCT_ROLES:
            resolved = frozenset({self.audience})
        else:
            resolved = frozenset()

        if not resolved.issubset(PRODUCT_ROLES):
            raise ValueError("Action audiences must be actual product roles")
        if self.kind in {TransitionKind.SYSTEM, TransitionKind.REVIEW} and resolved:
            raise ValueError("System and review transitions cannot have audiences")
        if self.kind in {TransitionKind.USER, TransitionKind.FACILITATOR} and not resolved:
            raise ValueError("Rendered controls require at least one product audience")
        expected_intent = {
            TransitionKind.SYSTEM: ActionIntent.SYSTEM_OUTCOME,
            TransitionKind.REVIEW: ActionIntent.REVIEW_EDGE,
        }.get(self.kind)
        if expected_intent is not None and self.intent is not expected_intent:
            raise ValueError(
                f"{self.kind.value} transitions require {expected_intent.value} intent"
            )
        destination_roles = tuple(
            destination.audience for destination in self.destinations
        )
        if len(destination_roles) != len(set(destination_roles)):
            raise ValueError("Action audience destinations must be unique")
        if self.destinations and set(destination_roles) != set(resolved):
            raise ValueError(
                "Shared action destinations must cover every declared audience"
            )
        if self.destinations and self.kind in {
            TransitionKind.SYSTEM,
            TransitionKind.REVIEW,
        }:
            raise ValueError(
                "System and review transitions cannot have audience destinations"
            )
        object.__setattr__(self, "audiences", resolved)

    def applies_to(self, role: Role) -> bool:
        """Return whether this control is available to an actual product role."""

        return role in self.audiences

    def target_for(self, role: Role) -> str:
        """Resolve this action's destination for one declared audience."""

        if not self.applies_to(role):
            raise ValueError(f"{self.label!r} does not apply to {role.value}")
        for destination in self.destinations:
            if destination.audience is role:
                return destination.target_id
        return self.target_id

    def resolved_for(self, role: Role) -> Action:
        """Return this immutable action with its audience destination resolved."""

        target_id = self.target_for(role)
        if target_id == self.target_id:
            return self
        return replace(self, target_id=target_id)


@dataclass(frozen=True, slots=True)
class ShellAction:
    """Immutable shell metadata kept separate from frame-body controls."""

    kind: ShellActionKind
    label: str
    target_id: str | None
    audiences: frozenset[Role]
    guard: TransitionGuard = TransitionGuard.ALWAYS

    def __post_init__(self) -> None:
        valid_roles = frozenset(Role)
        if not self.audiences or not self.audiences.issubset(valid_roles):
            raise ValueError("Shell actions require declared role audiences")
        if Role.CROSS_ROLE in self.audiences and self.audiences != frozenset(
            {Role.CROSS_ROLE}
        ):
            raise ValueError("A neutral shell state cannot mix product audiences")

    def applies_to(self, role: Role) -> bool:
        """Return whether this shell item applies to an actual product role."""

        return role in self.audiences


@dataclass(frozen=True, slots=True)
class TerminalResolutionRule:
    """One machine-readable fixed-end precedence rule."""

    priority: int
    condition: TerminalResolutionCondition
    guard: TransitionGuard
    target_id: str


@dataclass(frozen=True, slots=True)
class Frame:
    """All public rendering data for one directly addressable screen."""

    id: str
    role: Role
    phase: Phase
    title: str
    headline: str
    summary: str
    status_text: str
    cue_text: str
    content_blocks: tuple[ContentBlock, ...]
    primary_actions: tuple[Action, ...]
    secondary_actions: tuple[Action, ...]
    privacy_statement: str
    accessibility_note: str
    failure_exit_copy: str
    terminal_class: TerminalClass
    continuation: ContinuationClass
    system_transitions: tuple[Action, ...] = ()
    review_transitions: tuple[Action, ...] = ()
    presentation: SurfacePresentation | None = None

    @property
    def actions(self) -> tuple[Action, ...]:
        """Return only role-controlled actions in render order."""

        return self.primary_actions + self.secondary_actions

    @property
    def transitions(self) -> tuple[Action, ...]:
        """Return controls plus non-rendered system and review transitions."""

        return self.actions + self.system_transitions + self.review_transitions


def _block(heading: str, *body: str) -> ContentBlock:
    return ContentBlock(heading=heading, body=tuple(body))


def _make_action(
    label: str,
    target_id: str,
    audience: Role | None,
    guard: TransitionGuard = TransitionGuard.ALWAYS,
    *,
    kind: TransitionKind | None = None,
    audiences: frozenset[Role] | None = None,
    intent: ActionIntent,
    scope: ActionScope = ActionScope.ORDINARY,
    destinations: tuple[AudienceDestination, ...] = (),
) -> Action:
    if target_id == "S02":
        if scope is ActionScope.ORDINARY:
            scope = ActionScope.SAFETY
        if audience in _SAFETY_REPORT_TARGET_BY_ROLE:
            target_id = _SAFETY_REPORT_TARGET_BY_ROLE[audience]
        elif audience is Role.CROSS_ROLE and not destinations:
            destinations = tuple(
                AudienceDestination(role, destination)
                for role, destination in _SAFETY_REPORT_TARGET_BY_ROLE.items()
            )
    if kind is None:
        if audience is Role.FACILITATOR:
            kind = TransitionKind.FACILITATOR
        elif audience is not None:
            kind = TransitionKind.USER
        else:
            raise ValueError("Transitions without an audience require an explicit kind")
    return Action(
        label=label,
        target_id=target_id,
        audience=audience,
        kind=kind,
        guard=guard,
        audiences=audiences or frozenset(),
        intent=intent,
        scope=scope,
        destinations=destinations,
    )


def _navigate(
    label: str,
    target_id: str,
    audience: Role,
    guard: TransitionGuard = TransitionGuard.ALWAYS,
    *,
    audiences: frozenset[Role] | None = None,
    scope: ActionScope = ActionScope.ORDINARY,
    destinations: tuple[AudienceDestination, ...] = (),
) -> Action:
    """Declare an explicit product-role navigation transition."""

    return _make_action(
        label,
        target_id,
        audience,
        guard,
        audiences=audiences,
        intent=ActionIntent.NAVIGATION,
        scope=scope,
        destinations=destinations,
    )


def _preview(
    label: str,
    target_id: str,
    audience: Role,
    guard: TransitionGuard = TransitionGuard.ALWAYS,
    *,
    audiences: frozenset[Role] | None = None,
    scope: ActionScope = ActionScope.ORDINARY,
    destinations: tuple[AudienceDestination, ...] = (),
) -> Action:
    """Declare a noninteractive product-control state preview."""

    return _make_action(
        label,
        target_id,
        audience,
        guard,
        audiences=audiences,
        intent=ActionIntent.PROTOTYPE_CONTROL,
        scope=scope,
        destinations=destinations,
    )


def _system(
    label: str,
    target_id: str,
    guard: TransitionGuard,
) -> Action:
    return _make_action(
        label,
        target_id,
        None,
        guard,
        kind=TransitionKind.SYSTEM,
        intent=ActionIntent.SYSTEM_OUTCOME,
    )


def _review(
    label: str,
    target_id: str,
    guard: TransitionGuard,
) -> Action:
    return _make_action(
        label,
        target_id,
        None,
        guard,
        kind=TransitionKind.REVIEW,
        intent=ActionIntent.REVIEW_EDGE,
    )


_FIXED_END_TERMINAL_PRECEDENCE = (
    TerminalResolutionRule(
        priority=1,
        condition=TerminalResolutionCondition.FACILITATOR_SAFETY_COMMITTED,
        guard=TransitionGuard.MARA_CONFIRMED_SAFETY,
        target_id="C07",
    ),
    TerminalResolutionRule(
        priority=2,
        condition=TerminalResolutionCondition.UNRESOLVED_SAFETY_OR_INTEGRITY,
        guard=TransitionGuard.FAIL_CLOSED,
        target_id="S01",
    ),
    TerminalResolutionRule(
        priority=3,
        condition=TerminalResolutionCondition.KNOWN_NEUTRAL,
        guard=TransitionGuard.KNOWN_NEUTRAL_TRIGGER,
        target_id="C08",
    ),
    TerminalResolutionRule(
        priority=4,
        condition=TerminalResolutionCondition.HEALTHY_NORMAL,
        guard=TransitionGuard.HEALTHY_FIXED_END,
        target_id="C06",
    ),
)
_FIXED_END_TRANSITION_LABELS = MappingProxyType(
    {
        TerminalResolutionCondition.FACILITATOR_SAFETY_COMMITTED: (
            "Commit facilitator-confirmed safety termination"
        ),
        TerminalResolutionCondition.UNRESOLVED_SAFETY_OR_INTEGRITY: (
            "Fail closed on unresolved safety or integrity"
        ),
        TerminalResolutionCondition.KNOWN_NEUTRAL: (
            "Commit known-neutral closure"
        ),
        TerminalResolutionCondition.HEALTHY_NORMAL: (
            "Commit healthy normal completion"
        ),
    }
)


def _fixed_end_system_transitions() -> tuple[Action, ...]:
    return tuple(
        _system(
            _FIXED_END_TRANSITION_LABELS[rule.condition],
            rule.target_id,
            rule.guard,
        )
        for rule in _FIXED_END_TERMINAL_PRECEDENCE
    )


_RAW_FRAMES = (
    Frame(
        id="V01",
        role=Role.VIEWER,
        phase=Phase.RESEARCH,
        title="Research invitation and consent",
        headline="A small, facilitated introduction — fictional study preview",
        summary=(
            "Adult women seeking men may preview a bounded fictional circle with "
            "a fictional adult male participant and an independent facilitator."
        ),
        status_text="Synthetic study · fictional people only · Preview not entered",
        cue_text="Choosing not to continue is a complete outcome.",
        content_blocks=(
            _block(
                "What happens",
                "Review the fictional research frame, privacy boundary, and voluntary entry.",
                "Active acknowledgement is required before an adult-eligibility check.",
            ),
            _block(
                "What does not happen",
                "No real recording, no real location sharing, no real report submission, no real messaging, meeting, or research collection occurs.",
                "Joining grants no romantic, contact, media, touch, or sexual permission.",
            ),
        ),
        primary_actions=(
            _preview(
                "I understand — check adult eligibility",
                "V02",
                Role.VIEWER,
                TransitionGuard.CONSENT_ACKNOWLEDGED,
            ),
        ),
        secondary_actions=(
            _navigate("Read the study details", "V01", Role.VIEWER),
            _navigate("Review privacy boundaries", "V01", Role.VIEWER),
            _preview("Not now", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Consent and withdrawal stay private from Elias, Mara, other viewers, "
            "and ordinary profile surfaces."
        ),
        accessibility_note=(
            "Use unselected, visibly labeled acknowledgements, logical headings, "
            "announced errors, and focus on the first incomplete acknowledgement."
        ),
        failure_exit_copy=(
            "Study details are unavailable. You cannot continue yet. Try again or Exit."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V02",
        role=Role.VIEWER,
        phase=Phase.ELIGIBILITY,
        title="Adult eligibility gate",
        headline="Adults only (18+)",
        summary="Age eligibility is required before invitations or rooms.",
        status_text="Synthetic study · fictional people only · Eligibility unconfirmed",
        cue_text=(
            "Research wireframe status — no approved real-user verification service is claimed."
        ),
        content_blocks=(
            _block(
                "Eligibility state",
                "Only an established adult status permits progress.",
                "Unknown, checking, expired, unavailable, uncertain, and ineligible fail closed.",
            ),
            _block(
                "Private verification boundary",
                "Elias and other viewers receive no age data or verification artifact.",
                "Mara sees only whether circle entry is allowed.",
            ),
        ),
        primary_actions=(
            _preview("Check adult eligibility", "V02", Role.VIEWER),
            _navigate(
                "Continue as an eligible adult",
                "V03",
                Role.VIEWER,
                TransitionGuard.ADULT_ELIGIBLE,
            ),
        ),
        secondary_actions=(
            _preview("Why this is required", "V02", Role.VIEWER),
            _preview("Correct my details", "V02", Role.VIEWER),
            _preview("Exit Live Introductions", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Underlying identity material is not exposed to Elias, viewers, or the "
            "facilitator."
        ),
        accessibility_note=(
            "Announce pending, eligible, and blocked states in a polite status region "
            "without relying on color."
        ),
        failure_exit_copy=(
            "We could not establish adult eligibility, so Live Introductions stays unavailable."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V03",
        role=Role.VIEWER,
        phase=Phase.PREFERENCES,
        title="Reusable cue, pacing, and tone defaults",
        headline="Set neutral invitation defaults",
        summary=(
            "Set low-demand defaults before choosing a circle; saving is not a "
            "commitment or consent to join."
        ),
        status_text="Synthetic study · fictional people only · Neutral is the default",
        cue_text="You will review these again for every circle.",
        content_blocks=(
            _block(
                "Private defaults",
                "Participation: Listen only; pacing: Standard; helper cues: Standard.",
                "Viewer-local tone: Neutral, with Lightly romantic available only by choice.",
            ),
            _block(
                "Visibility boundary",
                "The setting stays private from Elias, Mara, and other viewers.",
                "Mara sees text actively submitted; selected text may be shared without authorship.",
            ),
        ),
        primary_actions=(
            _preview("Save invitation defaults", "V04", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Use neutral defaults", "V03", Role.VIEWER),
            _preview("Reset saved defaults", "V03", Role.VIEWER),
            _preview("Back", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Tone stays viewer-local; only a necessary accommodation or actively "
            "submitted text can reach Mara."
        ),
        accessibility_note=(
            "Render each choice group as a labeled fieldset and state reusable versus "
            "circle-specific scope in text."
        ),
        failure_exit_copy=(
            "If defaults cannot be retained, keep entered values visible and offer "
            "Use neutral defaults for now or Back."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V04",
        role=Role.VIEWER,
        phase=Phase.INVITATION,
        title="Curated scheduled circles",
        headline="Your Introduction Circle invitations",
        summary=(
            "Show a finite scheduled invitation rather than a live feed, ranking, "
            "or urgency loop."
        ),
        status_text="Synthetic study · fictional people only · Finite sessions · no drop-in audience",
        cue_text="Post-start cards disclose only your own entry or eligibility state.",
        content_blocks=(
            _block(
                "Scheduled invitation",
                "Elias, 29 · Small rituals that make a week feel like yours.",
                "7:30–7:42 PM EDT · Mara, independent facilitator · 12 minutes · no extension.",
            ),
            _block(
                "Audience boundary",
                "Invite only · six-viewer maximum.",
                "No autoplay, viewer count, waitlist pressure, popularity, or ranked carousel.",
            ),
        ),
        primary_actions=(
            _navigate("View circle", "V05", Role.VIEWER),
        ),
        secondary_actions=(
            _navigate("Review how circles work", "V04", Role.VIEWER),
            _preview("Decline invitation", ATLAS_TARGET, Role.VIEWER),
            _preview("Leave Live Introductions", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Invitation activity stays private; excluded invitees learn no room outcome "
            "after the entry window."
        ),
        accessibility_note=(
            "Give each stable card one heading and action, factual alt text, and a "
            "complete date, time, and time zone."
        ),
        failure_exit_copy=(
            "Loading invitations; You have no scheduled circles right now; or personal "
            "Entry window closed—never a post-start room outcome."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V05",
        role=Role.VIEWER,
        phase=Phase.INVITATION,
        title="Session detail",
        headline="Elias, 29",
        summary=(
            "Library-program coordinator · repairs old radios · learning sourdough."
        ),
        status_text="Synthetic study · fictional people only · Scheduled 7:30–7:42 PM EDT",
        cue_text="Small rituals that make a week feel like yours.",
        content_blocks=(
            _block(
                "Circle boundary",
                "Mara — independent facilitator · invite only · six-viewer maximum.",
                "Fixed 12-minute pilot · no extension · six disclosed conversation segments.",
            ),
            _block(
                "Verification qualifier",
                "Adult and identity checks completed for this study.",
                "Verification is not a guarantee of identity truth, compatibility, conduct, or safety.",
            ),
        ),
        primary_actions=(
            _navigate("Review the room briefing", "V06", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Save invitation", "V05", Role.VIEWER),
            _preview("Decline this circle", ATLAS_TARGET, Role.VIEWER),
            _preview("Report an invitation concern", "S02", Role.VIEWER),
            _navigate("Back to invitations", "V04", Role.VIEWER),
        ),
        privacy_statement=(
            "Opening detail exposes no viewer activity, roster, occupancy, acceptance "
            "count, ordinary profile, or exact location."
        ),
        accessibility_note=(
            "Read verification status with its qualifier and announce each start/end "
            "pair as one complete range."
        ),
        failure_exit_copy=(
            "A reschedule publishes a complete new fixed pair and requires fresh review; "
            "otherwise show Circle cancelled — no action needed."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V06",
        role=Role.VIEWER,
        phase=Phase.BRIEFING,
        title="Pre-room briefing and scoped join",
        headline="Before you join",
        summary=(
            "Confirm one featured participant, an independent facilitator, up to six "
            "viewers, and a fixed 12-minute circle."
        ),
        status_text="Synthetic study · fictional people only · Circle confirmation required",
        cue_text="You can leave quietly at any time.",
        content_blocks=(
            _block(
                "What joining means",
                "Join only this circle under a Mara-only session pseudonym with camera and microphone off.",
                "Joining grants no spark, profile, message, media, meeting, location, touch, or sexual permission.",
            ),
            _block(
                "Capture and participation boundary",
                EXTERNAL_CAPTURE_COPY,
                "Shared selected content reveals at least one viewer participated, never who, how many, or current presence.",
            ),
        ),
        primary_actions=(
            _preview(
                "Confirm for this circle and join the private lobby",
                "V07",
                Role.VIEWER,
                TransitionGuard.CIRCLE_CONFIRMED,
            ),
        ),
        secondary_actions=(
            _navigate("Change preferences for this circle", "V03", Role.VIEWER),
            _preview("Restore neutral defaults", "V06", Role.VIEWER),
            _preview("Decline this circle", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
            _navigate("Back", "V05", Role.VIEWER),
        ),
        privacy_statement=(
            "Only Mara may see the assigned session pseudonym and minimum necessary "
            "accommodation; Elias receives no roster, count, presence, or preference."
        ),
        accessibility_note=(
            "Place the concise boundary before details, use a full-sentence acknowledgement, "
            "and keep the footer clear at 200% zoom."
        ),
        failure_exit_copy=(
            "Review and confirm this circle before joining. Expired adult status, changed "
            "terms, missing facilitation, or closure blocks entry."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V07",
        role=Role.VIEWER,
        phase=Phase.LOBBY,
        title="Private lobby",
        headline="You’re in the private lobby",
        summary=(
            "Independently arm entry for the disclosed start without an exact-time click "
            "or dependence on another viewer."
        ),
        status_text="Synthetic study · fictional people only · Not armed",
        cue_text="Camera off · Microphone off · Other viewers cannot see you",
        content_blocks=(
            _block(
                "Scheduled entry",
                "At 7:30 PM, every valid armed viewer enters in one shared transition.",
                "Other viewers’ private choices do not block yours; no late entry follows.",
            ),
            _block(
                "Private readiness",
                "Only Mara sees each pseudonym’s minimum readiness.",
                "Elias receives no entrant count, aggregate-zero, presence, or cancellation reason.",
            ),
        ),
        primary_actions=(
            _preview(
                "Enter at scheduled start",
                "V07",
                Role.VIEWER,
            ),
        ),
        secondary_actions=(
            _preview("Cancel scheduled entry", ATLAS_TARGET, Role.VIEWER),
            _preview("Adjust preferences", "V03", Role.VIEWER),
            _preview("Use lower-bandwidth view", "V07", Role.VIEWER),
            _navigate("Review safety", "S02", Role.VIEWER),
            _preview("Leave quietly", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Peer state and room outcomes remain hidden; an excluded viewer receives "
            "only Entry window closed or her own eligibility failure."
        ),
        accessibility_note=(
            "Announce only this viewer’s arm, withdrawal, disconnection, invalidation, "
            "or admission; no action is required at the timestamp."
        ),
        failure_exit_copy=(
            "Entry window closed. If opening itself fails, only still-valid armed viewers "
            "receive This circle did not open at its scheduled start. It is cancelled."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=(
            _system(
                "Admit valid armed viewer at scheduled start",
                "V08",
                TransitionGuard.VALID_ARMED_START,
            ),
        ),
    ),
    Frame(
        id="V08",
        role=Role.VIEWER,
        phase=Phase.LIVE,
        title="Live room — viewer view",
        headline="Elias · featured participant",
        summary=(
            "Observe a calm, facilitated Introduction Circle in a finite, legible container."
        ),
        status_text="Synthetic study · fictional people only · Fixed end 7:42 PM EDT",
        cue_text="Mara · independent facilitator · Fixed 12-minute pilot · six-viewer maximum",
        content_blocks=(
            _block(
                "Current segment",
                "Prompt cards → private topic choice → one anonymous question with optional one follow-up.",
                "Times orient; no countdown, reactions, public chat, viewer tiles, or extension.",
            ),
            _block(
                "Private viewer shelf",
                "Choose a topic privately, ask anonymously, use neutral helper wording, or skip.",
                "Leave quietly and Safety remain available without affecting other viewers.",
            ),
        ),
        primary_actions=(
            _navigate("Open current prompt", "V08", Role.VIEWER),
            _navigate("Choose a topic privately", "V09", Role.VIEWER),
            _preview("Ask anonymously", "V10", Role.VIEWER),
            _navigate("Leave and reflect", "V11", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Skip this prompt", "V08", Role.VIEWER),
            _preview("Use neutral helper wording", "V08", Role.VIEWER),
            _preview("Flag a boundary privately", "S02", Role.VIEWER),
            _navigate("Leave quietly", "V11", Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
        ),
        privacy_statement=(
            "The viewer stays camera-off and mic-off. Elias gets no direct roster, "
            "identity, pseudonym, exact count, presence, exit, incoming spark, or analytics."
        ),
        accessibility_note=(
            "Provide ephemeral captions with speaker names, one polite segment announcement, "
            "44-by-44 targets, stable focus order, and instant reduced-motion swaps."
        ),
        failure_exit_copy=(
            "Reconnecting — you remain off camera and microphone. A pause says Mara paused "
            "the circle. You may wait or leave; the fixed end still applies."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V08A",
        role=Role.VIEWER,
        phase=Phase.SAFETY,
        title="Private safety clarification",
        headline="Private question from Mara",
        summary=(
            "Answer at most one session-scoped clarification without opening ordinary messaging."
        ),
        status_text="Synthetic study · fictional people only · Mara-only clarification",
        cue_text="Only Mara can see this exchange. You can decline, leave, or continue your report instead.",
        content_blocks=(
            _block(
                "Optional answer",
                "One bounded question and a short, visibly labeled response field.",
                "Declining records no adverse inference and never blocks the report path.",
            ),
            _block(
                "Scope",
                "The clarification stays under the session pseudonym.",
                "It exposes no ordinary profile and creates no ordinary private-message access.",
            ),
        ),
        primary_actions=(
            _preview("Send private answer", "V08", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Decline to answer", "V08", Role.VIEWER),
            _navigate("Continue report path", "S02", Role.VIEWER),
            _preview("Leave quietly", ATLAS_TARGET, Role.VIEWER),
            _navigate("Return to room", "V08", Role.VIEWER),
        ),
        privacy_statement=(
            "Only the viewer and Mara can see the clarification; Elias, peers, operators, "
            "and ordinary-message surfaces cannot."
        ),
        accessibility_note=(
            "Announce the question, privacy scope, and no-answer option together; start "
            "focus on the heading and keep decline, report, and leave in normal order."
        ),
        failure_exit_copy=(
            "If the answer cannot send, preserve it and offer Try again, Continue report "
            "without answering, and Leave quietly."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V09",
        role=Role.VIEWER,
        phase=Phase.LIVE,
        title="Private topic choice",
        headline="What would you like to hear next?",
        summary="Offer playful agency without public voting, tallies, or pressure.",
        status_text="Synthetic study · fictional people only · Choice stays private until selection",
        cue_text="Mara may share one selected topic, never its author, tally, or current presence.",
        content_blocks=(
            _block(
                "Topic cards",
                "A small ritual you care about.",
                "A time you changed your mind.",
                "Something you are learning slowly.",
            ),
            _block(
                "Neutral choices",
                "Keep it general and Skip this vote remain equally visible.",
                "A submitted choice can be withdrawn until selection or window close.",
            ),
        ),
        primary_actions=(
            _preview("Send private choice", "V08", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Keep it general", "V08", Role.VIEWER),
            _preview("Skip this vote", "V08", Role.VIEWER),
            _preview("Withdraw topic choice", "V09", Role.VIEWER),
            _preview("Close", "V08", Role.VIEWER),
        ),
        privacy_statement=(
            "Mara receives facilitation choices; Elias receives only a selected topic "
            "with no identity, tally, abstention, count, or presence."
        ),
        accessibility_note=(
            "Use one labeled single-choice group, announce selected text, preserve large "
            "text, and give Skip equal focus order and target size."
        ),
        failure_exit_copy=(
            "The conversation moved on — no choice was sent. A failed send preserves the "
            "unsent choice and offers Try again or Skip."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V10",
        role=Role.VIEWER,
        phase=Phase.LIVE,
        title="Anonymous question and bounded follow-up",
        headline="Ask through the facilitator",
        summary=(
            "Offer one bounded question and, after an answer, one optional facilitator-mediated follow-up."
        ),
        status_text="Synthetic study · fictional people only · No public chat or direct contact",
        cue_text="Mara may read, paraphrase, decline, or cut one author’s submission for time.",
        content_blocks=(
            _block(
                "Question",
                "Use a visible short composer and a neutral or viewer-local lightly romantic starter.",
                "Mara sees submitted text; selected shared text cannot be recalled.",
            ),
            _block(
                "One follow-up",
                "After Elias answers: That answered it, Offer one follow-up, or Leave it here.",
                "Withdraw a question or follow-up until selection; no queue, upvote, score, or typing indicator.",
            ),
        ),
        primary_actions=(
            _preview("Send to Mara", "V10", Role.VIEWER),
            _preview("Send one follow-up to Mara", "V08", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Use a neutral starter", "V10", Role.VIEWER),
            _preview("That answered it", "V08", Role.VIEWER),
            _preview("Offer one follow-up", "V10", Role.VIEWER),
            _preview("Leave it here", "V08", Role.VIEWER),
            _preview("Withdraw question", "V10", Role.VIEWER),
            _preview("Withdraw follow-up", "V10", Role.VIEWER),
        ),
        privacy_statement=(
            "Drafts stay author-only. Mara sees submitted text and one session pseudonym; "
            "Elias and viewers receive no authorship, count, presence, or private status."
        ),
        accessibility_note=(
            "Persist composer labels and concise character counts, announce answer "
            "availability once, and move focus to withdrawal or the post-answer group."
        ),
        failure_exit_copy=(
            "Not used in this circle — you did nothing wrong; The circle is moving to "
            "close — your follow-up was not shared; or Question time has ended."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="V11",
        role=Role.VIEWER,
        phase=Phase.REFLECTION,
        title="Post-room private debrief",
        headline="Take a private beat",
        summary=(
            "Reflect privately after any terminal route; only verified normal completion "
            "may expose the separate spark choice."
        ),
        status_text="Synthetic study · fictional people only · Reflection is private and skippable",
        cue_text="Safety, integrity, neutral closure, and silent exit create no Live-derived continuation.",
        content_blocks=(
            _block(
                "Private reflection",
                "How settled do you feel?",
                "Did the room boundaries feel respected?",
                "Optional curiosity and private note.",
            ),
            _block(
                "Terminal provenance",
                "Only a C06 normal-completion variant may continue to V12 after save or skip.",
                "Every variant retains Return to ordinary app, report, and block choices.",
            ),
        ),
        primary_actions=(
            _preview("Save my private reflection", "V11", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Skip reflection", "V11", Role.VIEWER),
            _navigate(
                "Continue to private spark choice",
                "V12",
                Role.VIEWER,
                TransitionGuard.NORMAL_COMPLETION_ONLY,
                scope=ActionScope.LIVE_DERIVED_CONTINUATION,
            ),
            _preview("Report a concern", "S02", Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Return to ordinary app", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Reflections, notes, and viewer-local wording are not shown to Elias, Mara, "
            "other viewers, operators, or social-proof surfaces."
        ),
        accessibility_note=(
            "Use labeled fieldsets, explicit Skip, visible note labels, and report access "
            "before and after the form."
        ),
        failure_exit_copy=(
            "Save failure preserves answers and never blocks Return to ordinary app. "
            "Non-normal provenance suppresses only this circle’s Live-derived continuation."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.NORMAL_COMPLETION_ONLY,
    ),
    Frame(
        id="V12",
        role=Role.VIEWER,
        phase=Phase.INTEREST,
        title="Private spark choice",
        headline="Would you like to leave a private spark for Elias?",
        summary="A spark is the viewer’s sealed interest action only.",
        status_text="Synthetic study · fictional people only · C06 normal completion required",
        cue_text="A spark is an interest signal, not a match or permission to contact you.",
        content_blocks=(
            _block(
                "Equal choices",
                "Send a spark.",
                "Not now.",
                "No spark.",
            ),
            _block(
                "Exact scope",
                "Expires July 30, 2026 at 7:42 PM EDT unless withdrawn or reciprocal interest is confirmed.",
                "No countdown, reminder, profile sharing, message permission, meeting, or location follows.",
            ),
        ),
        primary_actions=(
            _preview("Confirm my choice", "V12", Role.VIEWER),
        ),
        secondary_actions=(
            _navigate(
                "Continue after sealed spark",
                "V13",
                Role.VIEWER,
                TransitionGuard.VIEWER_SPARK_SENT,
            ),
            _navigate("Review what a spark means", "V12", Role.VIEWER),
            _navigate("Back to reflection", "V11", Role.VIEWER),
            _preview("Leave without choosing", ATLAS_TARGET, Role.VIEWER),
            _preview("Withdraw my spark", "V12", Role.VIEWER),
        ),
        privacy_statement=(
            "The sealed choice reveals no session pseudonym, ordinary profile, photo, "
            "media, room provenance, location, or message permission."
        ),
        accessibility_note=(
            "Give all three choices equal semantic weight, target size, and descriptive "
            "text; preselect nothing and announce confirmation privately."
        ),
        failure_exit_copy=(
            "V12 is unavailable without verified C06 provenance. Your choice was not "
            "sent. Expiry closes neutrally with no reminder or loss framing."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.NORMAL_COMPLETION_ONLY,
    ),
    Frame(
        id="V13",
        role=Role.VIEWER,
        phase=Phase.INTEREST,
        title="Spark and optional profile eligibility",
        headline="Your spark is sealed",
        summary=(
            "Separately choose whether an ordinary profile may enter delayed, mixed "
            "standard discovery during the active seven-day window."
        ),
        status_text="Synthetic study · fictional people only · Profile eligibility off",
        cue_text="No immediate post-room handoff, badge, room order, or timing cue.",
        content_blocks=(
            _block(
                "Separate choice",
                "Allow profile eligibility, Not now, or Do not allow.",
                "If adequate delay and mixing cannot be provided, eligibility stays unavailable.",
            ),
            _block(
                "Recognition limit",
                "Residual inference or recognition cannot be guaranteed away.",
                "Withdrawal prevents future display but cannot recall a profile already shown.",
            ),
        ),
        primary_actions=(
            _preview("Confirm profile-eligibility choice", "V13", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Withdraw profile eligibility", "V13", Role.VIEWER),
            _preview("Withdraw my spark", "V13", Role.VIEWER),
            _preview("Done for now", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Mara and operators receive no profile or standard-discovery decision; "
            "V13 never reveals whether display occurred."
        ),
        accessibility_note=(
            "Use an unselected labeled group and read no-provenance plus both possible "
            "post-display withdrawal consequences before confirmation."
        ),
        failure_exit_copy=(
            "Mixing unavailable keeps eligibility off without affecting the sealed spark. "
            "Expiry says No reciprocal interest was confirmed."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
        system_transitions=(
            _system(
                "Show reciprocal-interest outcome after mutual confirmation",
                "V14",
                TransitionGuard.MUTUAL_INTEREST,
            ),
            _system(
                "Show neutral outcome when reciprocal interest is not confirmed",
                "V15",
                TransitionGuard.MUTUAL_INTEREST_NOT_CONFIRMED,
            ),
        ),
    ),
    Frame(
        id="V14",
        role=Role.VIEWER,
        phase=Phase.INTEREST,
        title="Reciprocal-interest outcome",
        headline="Reciprocal interest confirmed",
        summary=(
            "The viewer’s active sealed spark and Elias’s independent standard-discovery "
            "interest aligned as a private mutual outcome."
        ),
        status_text="Synthetic study · fictional people only · Private pair outcome",
        cue_text="Nothing opens automatically.",
        content_blocks=(
            _block(
                "Context each person keeps",
                "Elias keeps only ordinary profile context already seen.",
                "The viewer keeps only Elias’s featured-participant context; no new profile exchange occurs.",
            ),
            _block(
                "No inherited permission",
                "Reciprocal interest is not messaging, media, meeting, location, touch, or sexual consent.",
                "Pair-only text requires a separate choice from each person.",
            ),
        ),
        primary_actions=(
            _navigate("Review private connection choices", "V16", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Not now", ATLAS_TARGET, Role.VIEWER),
            _preview("Withdraw from reciprocal interest", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
        ),
        privacy_statement=(
            "Only the pair sees the outcome; no facilitator notice, public match card, "
            "room-viewer history, roster, testimonial, or popularity increment exists."
        ),
        accessibility_note=(
            "Announce outcome and qualifier together, start focus on the heading, and "
            "keep Not now and safety actions prominent."
        ),
        failure_exit_copy=(
            "We cannot confirm reciprocal interest. No connection opened. Pre-open "
            "withdrawal closes pending permissions without erasing already seen information."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
    ),
    Frame(
        id="V15",
        role=Role.VIEWER,
        phase=Phase.TERMINAL,
        title="No reciprocal interest",
        headline="No reciprocal interest was confirmed",
        summary="Close the handoff neutrally without exposing either person’s choice or reason.",
        status_text="Synthetic study · fictional people only · Live-derived path closed",
        cue_text="Private choices and reasons stay private. Your reflection remains yours.",
        content_blocks=(
            _block(
                "Neutral outcome",
                "No portrait rejection card, loss language, reminder, countdown, or retry pressure.",
                "The state may represent expiry, withdrawal, no display, or no aligned choice without revealing which.",
            ),
            _block(
                "Ordinary navigation",
                "Return to invitations or leave Live Introductions.",
                "Unrelated ordinary discovery and dating reach remain unchanged.",
            ),
        ),
        primary_actions=(
            _navigate("Return to invitations", "V04", Role.VIEWER),
        ),
        secondary_actions=(
            _navigate(
                "Review my private reflection",
                "V11",
                Role.VIEWER,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
            _preview("Leave Live Introductions", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Neither person learns profile-display status, the other choice, expiry cause, "
            "or reason; residual recognition cannot be guaranteed away."
        ),
        accessibility_note=(
            "State the outcome directly, keep actions in predictable order, and encode "
            "no meaning through muted color alone."
        ),
        failure_exit_copy=(
            "If status is pending, remain on V13 rather than guessing. At exact expiry, "
            "use the same neutral outcome with no re-engagement prompt."
        ),
        terminal_class=TerminalClass.NEUTRAL_OUTCOME,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
    Frame(
        id="V16",
        role=Role.VIEWER,
        phase=Phase.CONNECTION,
        title="Separate text-connection permission",
        headline="Choose whether to open a text-only connection",
        summary="Ask each person separately before asynchronous pair-only text can open.",
        status_text="Synthetic study · fictional people only · Messaging permission not granted",
        cue_text="Reciprocal interest did not grant messaging permission.",
        content_blocks=(
            _block(
                "Text-only scope",
                "Display identities already known · no new profile exchange.",
                "No dedicated media, location, contact, calendar, meeting pin, presence, read, or typing controls.",
            ),
            _block(
                "Private choices",
                "Allow messages, Not now, or Do not connect.",
                "Permission expires July 30, 2026 at 8:10 PM EDT unless withdrawn or declined.",
            ),
        ),
        primary_actions=(
            _preview("Confirm connection choice", "V16", Role.VIEWER),
        ),
        secondary_actions=(
            _preview("Not now", ATLAS_TARGET, Role.VIEWER),
            _preview("Withdraw connection permission", ATLAS_TARGET, Role.VIEWER),
            _preview("Withdraw from reciprocal interest", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Each choice stays sealed until both allow text; no reason, new profile, "
            "room history, or ordinary-message access reaches Mara or operators."
        ),
        accessibility_note=(
            "Use one unselected labeled group, read scope and exclusions before action, "
            "and return focus to the group when no choice is made."
        ),
        failure_exit_copy=(
            "Waiting privately — no messages can be sent. Unavailable, withdrawn, declined, "
            "or expired permission never opens a unilateral thread."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
        system_transitions=(
            _system(
                "Open private asynchronous connection after mutual permission",
                "V17",
                TransitionGuard.MUTUAL_TEXT_PERMISSION,
            ),
        ),
    ),
    Frame(
        id="V17",
        role=Role.VIEWER,
        phase=Phase.CONNECTION,
        title="Private asynchronous connection",
        headline="A quiet connection with Elias",
        summary=(
            "Show a static pair-only text-first continuation only after both people "
            "separately permit it."
        ),
        status_text="Synthetic study · fictional people only · No real messages are sent",
        cue_text="Reply when you want — no online, typing, or read-pressure signals.",
        content_blocks=(
            _block(
                "Pair-only text preview",
                "Display identities and asymmetric context already legitimately known.",
                "No new profile exchange or operator/facilitator message view.",
            ),
            _block(
                "Free-text warning",
                "Do not share addresses, live location, travel routes, phone/email, social handles, or calendar links.",
                "Text may be read or externally captured and cannot be recalled; no filtering or surveillance is claimed.",
            ),
        ),
        primary_actions=(
            _preview("Send message", "V17", Role.VIEWER),
        ),
        secondary_actions=(
            _navigate(
                "Review meeting readiness",
                "V18",
                Role.VIEWER,
                TransitionGuard.DELIBERATE_REVALIDATION,
            ),
            _preview("Pause messages", "V17", Role.VIEWER),
            _preview("Unmatch", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
            _preview("Leave conversation", ATLAS_TARGET, Role.VIEWER),
        ),
        privacy_statement=(
            "Only the pair sees the static conversation preview; no real messaging, "
            "delivery, presence, read state, facilitator view, or operator view exists."
        ),
        accessibility_note=(
            "Label sender and time, persist the composer name, wrap long text, and move "
            "focus to an actionable error after a failed synthetic send."
        ),
        failure_exit_copy=(
            "Failed text remains Not sent with Try again or Delete. Pause disables the "
            "composer; Unmatch closes the connection and meeting stages."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
    ),
    Frame(
        id="V18",
        role=Role.VIEWER,
        phase=Phase.MEETING,
        title="Private meeting-readiness choice",
        headline="How do you feel about discussing a meeting?",
        summary="Make a fresh private seven-day choice only after deliberate entry.",
        status_text="Synthetic study · fictional people only · Meeting readiness not reviewed",
        cue_text="Reciprocal interest is not consent to meet.",
        content_blocks=(
            _block(
                "Fresh choices",
                "Not now; Open to discussing a meeting; I do not want to meet.",
                "Not now sends no state. Only your own exact expiry is shown.",
            ),
            _block(
                "No location or scheduling",
                "No meeting is scheduled and no structured location, calendar, contact, route, or pin is shared.",
                "A failed deliberate revalidation says only Meeting readiness is no longer mutual.",
            ),
        ),
        primary_actions=(
            _preview("Save my readiness choice", "V18", Role.VIEWER),
        ),
        secondary_actions=(
            _navigate("Open the meeting safety checklist", "V18", Role.VIEWER),
            _navigate("Return to messages", "V17", Role.VIEWER),
            _preview("Withdraw meeting readiness", "V18", Role.VIEWER),
            _preview("Unmatch", ATLAS_TARGET, Role.VIEWER),
            _preview("Block", ATLAS_TARGET, Role.VIEWER),
            _preview("Report", "S02", Role.VIEWER),
        ),
        privacy_statement=(
            "No other-person expiry, prior choice, cause, timestamp, or live update is "
            "shown; own-action inference cannot be eliminated."
        ),
        accessibility_note=(
            "Do not push, live-announce, or move focus for another person’s state; announce "
            "only the neutral closure after deliberate revalidation."
        ),
        failure_exit_copy=(
            "Meeting readiness is no longer mutual. Return to meeting readiness with "
            "fresh unselected V18 choices. No cause, timestamp, or other-person state is shown."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
        system_transitions=(
            _system(
                "Show mutual meeting-readiness boundary after successful revalidation",
                "V19",
                TransitionGuard.MUTUAL_READINESS_REVALIDATED,
            ),
            _system(
                "Return to fresh meeting readiness when mutuality is not confirmed",
                "V18",
                TransitionGuard.MUTUAL_READINESS_NOT_CONFIRMED,
            ),
        ),
    ),
    Frame(
        id="V19",
        role=Role.VIEWER,
        phase=Phase.MEETING,
        title="Mutual meeting-readiness boundary",
        headline="Meeting readiness was mutual at your last check",
        summary=(
            "Show a last-valid snapshot and revalidate before any dedicated discussion action."
        ),
        status_text="Synthetic study · fictional people only · Last-valid snapshot",
        cue_text="No meeting is scheduled, and this readiness state shared no structured location.",
        content_blocks=(
            _block(
                "Owner-only timing",
                "Show only Your readiness expires … with no hidden-earlier-end disclosure.",
                "No push, live update, reminder, countdown, map, calendar, or meeting pin.",
            ),
            _block(
                "Safety checklist",
                "Control your transport; choose a public setting if later agreed; tell a trusted person if you wish.",
                "You may change your mind; free text may be externally captured and cannot be recalled.",
            ),
        ),
        primary_actions=(
            _preview(
                "Discuss it in the private connection",
                "V19",
                Role.VIEWER,
                TransitionGuard.DELIBERATE_REVALIDATION,
            ),
        ),
        secondary_actions=(
            _navigate(
                "Return to messages",
                "V17",
                Role.VIEWER,
                TransitionGuard.RETURN_NAVIGATION,
            ),
            _navigate("Return to meeting readiness", "V18", Role.VIEWER),
            _preview("Withdraw meeting readiness", "V18", Role.VIEWER),
            _navigate("Review safety", "S02", Role.VIEWER),
            _preview("Unmatch", ATLAS_TARGET, Role.VIEWER),
            _preview("Block", ATLAS_TARGET, Role.VIEWER),
            _preview("Report", "S02", Role.VIEWER),
        ),
        privacy_statement=(
            "Closure reveals only that readiness became non-mutual since the last valid "
            "check, never exact cause, time, or the other person’s prior state."
        ),
        accessibility_note=(
            "Do not announce another person’s expiry or withdrawal while open; a failed "
            "deliberate check uses identical closure copy and control."
        ),
        failure_exit_copy=(
            "Meeting readiness is no longer mutual. Return to meeting readiness; both "
            "restart unselected in V18 and no reminder or prior state appears."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
        system_transitions=(
            _system(
                "Keep discussion affordance after successful revalidation",
                "V19",
                TransitionGuard.MUTUAL_READINESS_REVALIDATED,
            ),
            _system(
                "Return to fresh meeting readiness when mutuality is not confirmed",
                "V18",
                TransitionGuard.MUTUAL_READINESS_NOT_CONFIRMED,
            ),
        ),
    ),
    Frame(
        id="F01",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.ELIGIBILITY,
        title="Adult and identity verification status",
        headline="Participation eligibility",
        summary="Establish fictional eligibility before Elias can prepare or appear.",
        status_text="Synthetic study · fictional people only · Adult status unconfirmed",
        cue_text="Wireframe state only — not an approved real-user verification claim.",
        content_blocks=(
            _block(
                "Required status",
                "Adult status established · identity check completed for this study.",
                "Only an established state can continue to preparation.",
            ),
            _block(
                "Honest qualifier",
                "Verification does not guarantee identity truth, compatibility, conduct, or safety.",
                "Viewers receive only this bounded status and qualifier.",
            ),
        ),
        primary_actions=(
            _navigate(
                "Continue to policy and training",
                "F02",
                Role.FEATURED_PARTICIPANT,
                TransitionGuard.ADULT_ELIGIBLE,
            ),
        ),
        secondary_actions=(
            _navigate(
                "Review what verification means",
                "F01",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Correct details", "F01", Role.FEATURED_PARTICIPANT),
            _preview(
                "Withdraw from the study preview",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Viewers receive no identity material; Mara sees eligibility status only."
        ),
        accessibility_note=(
            "Read status and qualifier together, repeat icon meaning in words, and move "
            "focus to any blocked reason."
        ),
        failure_exit_copy=(
            "Pending, uncertain, unavailable, expired, or under-18: You cannot enter "
            "preparation or a circle."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="F02",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.PREPARATION,
        title="Policy and facilitation training",
        headline="How to take part without taking over",
        summary="Review viewer privacy, facilitator authority, and non-retaliation boundaries.",
        status_text="Synthetic study · fictional people only · Training review incomplete",
        cue_text="Viewers control participation · Mara controls pacing · skips and exits need no explanation.",
        content_blocks=(
            _block(
                "Room boundaries",
                "No real recording, sexual pressure, viewer-identification attempt, or location/contact solicitation.",
                "Use neutral alternatives and respect Mara’s pause and end authority.",
            ),
            _block(
                "Capture limitation",
                EXTERNAL_CAPTURE_COPY,
                "Training responses never become a public trust score.",
            ),
        ),
        primary_actions=(
            _preview(
                "Complete training review",
                "F03",
                Role.FEATURED_PARTICIPANT,
                TransitionGuard.TRAINING_COMPLETE,
            ),
        ),
        secondary_actions=(
            _navigate(
                "Review community boundaries",
                "F02",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Ask Mara a private preparation question",
                "F02",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Withdraw from this circle",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Viewers never see training responses; Mara sees readiness and session-only "
            "questions, not unrelated profiles or messages."
        ),
        accessibility_note=(
            "Scenarios use labeled radio groups; explanations are available before retrying; "
            "progress is stated as modules remaining, not a performance score; keyboard and "
            "screen-reader order follows the visible order."
        ),
        failure_exit_copy=(
            "Incomplete or unavailable training blocks rehearsal; disagreement offers "
            "Withdraw from this circle without pressure."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="F03",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.PREPARATION,
        title="Rehearsal and media check",
        headline="Rehearse the conversation, not a performance",
        summary="Practice the run of show and choose respectful fallbacks before the circle.",
        status_text="Synthetic study · fictional people only · No saved rehearsal or real recording",
        cue_text="The run of show matters more than appearance controls.",
        content_blocks=(
            _block(
                "Practice setup",
                "Self preview, microphone/camera state, ephemeral caption preview, and lower-bandwidth fallback.",
                "Use neutral prompt, Skip, and compact prompt remain available.",
            ),
            _block(
                "No performance scoring",
                "No beauty filter, body-framing guide, applause, retake streak, or engagement meter.",
                "A reschedule request never consumes or extends the live window.",
            ),
        ),
        primary_actions=(
            _preview("Run a short rehearsal", "F04", Role.FEATURED_PARTICIPANT),
        ),
        secondary_actions=(
            _preview(
                "Try another neutral prompt",
                "F03",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Check captions", "F03", Role.FEATURED_PARTICIPANT),
            _preview(
                "Use lower-bandwidth setup",
                "F03",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Request pre-start reschedule",
                "F04",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Exit preparation",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Rehearsal is visible only to Elias and explicitly invited Mara; viewers see "
            "no rehearsal material and no artifact is saved."
        ),
        accessibility_note=(
            "Name every control and state, offer a text rehearsal path, enlarge captions, "
            "and announce warnings without waveform dependence."
        ),
        failure_exit_copy=(
            "Offer retry, lower bandwidth, or Request pre-start reschedule; never falsely "
            "mark readiness or move the fixed live end."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="F04",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.LOBBY,
        title="Featured-participant greenroom",
        headline="Greenroom · circle 7:30–7:42 PM",
        summary="Prepare privately with Mara without exposing viewer lobby presence.",
        status_text="Synthetic study · fictional people only · Readiness not recorded",
        cue_text="Viewer side remains private · six-viewer maximum",
        content_blocks=(
            _block(
                "Displayed pair",
                "Fixed 12-minute start/end pair, six-segment run of show, captions, and device state.",
                "A reschedule replaces the complete pair and clears prior readiness.",
            ),
            _block(
                "Roster-blind boundary",
                "No viewer list, pseudonym, profile, arrival, lobby indicator, one-line introduction, or count.",
                "Mara’s private session panel is visually distinct from Elias.",
            ),
        ),
        primary_actions=(
            _preview(
                "Tell Mara I’m ready for this time",
                "F04",
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        secondary_actions=(
            _navigate("Review prompts", "F04", Role.FEATURED_PARTICIPANT),
            _preview(
                "Request reschedule",
                "F04",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Message Mara about this session only",
                "F04",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Withdraw from the circle",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Elias gets no viewer identity, pseudonym, profile, preference, arrival, "
            "decline, spark, or analytics; the private preparation exchange stays session-only."
        ),
        accessibility_note=(
            "State all status changes in text, announce replacement start/end together, "
            "and keep focus stable when timing changes."
        ),
        failure_exit_copy=(
            "If Elias, Mara, or required integrity is not ready at the disclosed start, "
            "the pair closes; publish a complete future pair or cancel, never open late."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=(
            _system(
                "Admit ready featured participant at scheduled start",
                "F05",
                TransitionGuard.VALID_ARMED_START,
            ),
        ),
    ),
    Frame(
        id="F05",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.LIVE,
        title="Live room — featured-participant view",
        headline="Respond as a human participant",
        summary="Answer or skip facilitator-provided prompts while Mara retains independent control.",
        status_text="Synthetic study · fictional people only · Fixed end 7:42 PM EDT",
        cue_text="Viewer side private · maximum six · no direct count or current presence",
        content_blocks=(
            _block(
                "Conversation rail",
                "Mara, current segment, fixed end, selected topic, and one-author anonymous question.",
                "One optional follow-up may be relayed only by Mara.",
            ),
            _block(
                "No audience analytics",
                "No roster, pseudonym, count, arrival, exit, reaction, question author, incoming spark, or watch-time signal.",
                "Selected content may reveal at least one participant, never who, how many, or current presence.",
            ),
        ),
        primary_actions=(
            _preview(
                "Answer when ready",
                "F05",
                Role.FEATURED_PARTICIPANT,
            ),
            _navigate(
                "Ready for Mara to continue",
                "F05",
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        secondary_actions=(
            _preview(
                "Ask Mara to repeat",
                "F05",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Use neutral prompt", "F05", Role.FEATURED_PARTICIPANT),
            _preview("Skip this one", "F05", Role.FEATURED_PARTICIPANT),
            _preview("Decline follow-up", "F05", Role.FEATURED_PARTICIPANT),
            _preview("Ask Mara to pause", "F05", Role.FEATURED_PARTICIPANT),
            _preview(
                "End my participation",
                "F05",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Flag my own concern", "S02", Role.FEATURED_PARTICIPANT),
        ),
        privacy_statement=(
            "Elias receives no direct viewer identity, count, presence, private choice, "
            "reflection, incoming spark, or analytics; residual inference from shared text remains possible."
        ),
        accessibility_note=(
            "Support large prompt text and captions, announce segments, and convey no hidden "
            "viewer-presence information through sound, focus, or live regions."
        ),
        failure_exit_copy=(
            "Disconnection pauses. End my participation commits neutral C08. Unconfirmed "
            "safety or integrity closes through S01; only healthy normal provenance reaches C06."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=(
            _system(
                "Commit neutral closure after featured exit",
                "C08",
                TransitionGuard.KNOWN_NEUTRAL_TRIGGER,
            ),
            _system(
                "Open normal closeout at the healthy fixed end",
                "C06",
                TransitionGuard.HEALTHY_FIXED_END,
            ),
        ),
    ),
    Frame(
        id="F06",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.REFLECTION,
        title="Private post-session reflection",
        headline="Reflect privately after the circle",
        summary="Offer a skippable reflection after every terminal route without audience metrics.",
        status_text="Synthetic study · fictional people only · Private reflection",
        cue_text="Unrelated ordinary discovery is unchanged.",
        content_blocks=(
            _block(
                "Private prompts",
                "Did you feel able to be yourself?",
                "Did you respect the stated boundaries?",
                "Optional note and synthetic concern route.",
            ),
            _block(
                "Provenance boundary",
                "Only C06 normal completion may permit delayed and mixed ordinary profile eligibility.",
                "C07, C08, and S01 suppress only this circle’s Live-derived path.",
            ),
        ),
        primary_actions=(
            _preview(
                "Save my private reflection",
                "F06",
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        secondary_actions=(
            _preview("Skip reflection", "F06", Role.FEATURED_PARTICIPANT),
            _navigate(
                "Continue to standard discovery",
                "F07",
                Role.FEATURED_PARTICIPANT,
                TransitionGuard.NORMAL_COMPLETION_ONLY,
                scope=ActionScope.LIVE_DERIVED_CONTINUATION,
            ),
            _preview(
                "Raise a concern with the study team",
                "S02",
                Role.FEATURED_PARTICIPANT,
            ),
            _navigate(
                "Review room boundaries",
                "F06",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Return to ordinary app",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Viewers never see the reflection; it reveals no viewer identity, count, "
            "presence, exit, profile, message, or private outcome."
        ),
        accessibility_note=(
            "Use labeled groups with explicit Skip, support large note text, and expose "
            "the concern route before saving."
        ),
        failure_exit_copy=(
            "Save failure preserves text and never blocks ordinary navigation. Non-normal "
            "routes cannot open Live-derived candidate eligibility."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.NORMAL_COMPLETION_ONLY,
    ),
    Frame(
        id="F07",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.DISCOVERY,
        title="Roster-blind standard discovery decision",
        headline="One ordinary candidate",
        summary="Make a standard candidate decision after sufficient delay and mixing.",
        status_text="Synthetic study · fictional people only · No Live provenance shown",
        cue_text="No badge, room name, session pseudonym, room order, incoming-interest, or timing cue.",
        content_blocks=(
            _block(
                "Ordinary discovery",
                "One candidate profile appears among ordinary candidates only after delay and adequate mixing.",
                "Interested, Not now, and Pass receive equal treatment.",
            ),
            _block(
                "Residual recognition",
                "Recognition or inference cannot be guaranteed away.",
                "If adequate mixing is unavailable, no Live-derived eligible profile appears.",
            ),
        ),
        primary_actions=(
            _preview(
                "Interested",
                "F07",
                Role.FEATURED_PARTICIPANT,
                TransitionGuard.ADEQUATE_MIXING,
            ),
        ),
        secondary_actions=(
            _preview("Not now", "F07", Role.FEATURED_PARTICIPANT),
            _preview("Pass", "F07", Role.FEATURED_PARTICIPANT),
            _preview(
                "Withdraw discovery interest",
                "F07",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Block", ATLAS_TARGET, Role.FEATURED_PARTICIPANT),
            _preview("Report", "S02", Role.FEATURED_PARTICIPANT),
        ),
        privacy_statement=(
            "Elias gets no Live roster, incoming interest, room order, or analytics; Mara "
            "and operators get no ordinary profile or discovery choice."
        ),
        accessibility_note=(
            "Use one semantic ordinary-profile region, equal accessible action names and "
            "targets, and announce no hidden provenance."
        ),
        failure_exit_copy=(
            "Candidate unavailable is an ordinary state. A shown profile cannot be unseen; "
            "failed or withdrawn interest cannot align."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
        system_transitions=(
            _system(
                "Show reciprocal-interest connection choice after mutual confirmation",
                "F08",
                TransitionGuard.MUTUAL_INTEREST,
            ),
        ),
    ),
    Frame(
        id="F08",
        role=Role.FEATURED_PARTICIPANT,
        phase=Phase.CONNECTION,
        title="Standard reciprocal-interest connection choice",
        headline="Reciprocal interest confirmed",
        summary=(
            "Two independent active interests aligned as a private mutual outcome; "
            "messages still require separate permission."
        ),
        status_text="Synthetic study · fictional people only · No real connection opened",
        cue_text="You both independently chose interest. No messages open automatically.",
        content_blocks=(
            _block(
                "Context each person keeps",
                "Elias retains ordinary profile context already seen; the viewer retains Elias’s circle context.",
                "No new profile exchange or Live provenance is added.",
            ),
            _block(
                "Text-only permission",
                "Allow messages, Not now, or Do not connect.",
                "No dedicated media, location, contact, calendar, presence, read, typing, room history, or meeting pin.",
            ),
        ),
        primary_actions=(
            _preview(
                "Confirm connection choice",
                "F08",
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        secondary_actions=(
            _preview("Not now", ATLAS_TARGET, Role.FEATURED_PARTICIPANT),
            _preview(
                "Withdraw connection permission",
                "F08",
                Role.FEATURED_PARTICIPANT,
            ),
            _preview(
                "Withdraw from reciprocal interest",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
            _preview("Block", ATLAS_TARGET, Role.FEATURED_PARTICIPANT),
            _preview("Report a concern", "S02", Role.FEATURED_PARTICIPANT),
        ),
        privacy_statement=(
            "Permission exchanges no profile, room history, reason, or real message; Mara "
            "and operators see no ordinary profile, choice, or conversation."
        ),
        accessibility_note=(
            "Read outcome with its qualifier, preselect no choice, and keep no-contact and "
            "safety actions in the main focus order."
        ),
        failure_exit_copy=(
            "Pending permission keeps messaging closed. Withdrawal, decline, or exact "
            "expiry prevents a thread without exposing a reason."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.MUTUAL_CHOICE_ONLY,
    ),
    Frame(
        id="C01",
        role=Role.FACILITATOR,
        phase=Phase.FACILITATION,
        title="Assignment and run-of-show review",
        headline="Assigned Introduction Circle",
        summary="Establish Mara’s independent authority and the bounded fictional protocol.",
        status_text="Synthetic study · fictional people only · Assignment not accepted",
        cue_text="Elias · featured participant · Mara · independent facilitator",
        content_blocks=(
            _block(
                "Fixed run of show",
                "0:00–1:30 welcome; 1:30–3:00 introduction; 3:00–5:30 prompt cards.",
                "5:30–7:30 topic; 7:30–10:45 question/follow-up; 10:45–12:00 close.",
            ),
            _block(
                "Protected boundary",
                "Invite only · six-viewer maximum · fixed 12 minutes · no extension.",
                "Cut follow-up, then topic elaboration, then use the compact core prompt; never cut safety or close.",
            ),
        ),
        primary_actions=(
            _preview(
                "Accept facilitation assignment",
                "C02",
                Role.FACILITATOR,
            ),
        ),
        secondary_actions=(
            _navigate("Review cut order", "C01", Role.FACILITATOR),
            _navigate("Open protocol", "C01", Role.FACILITATOR),
            _preview("Declare a conflict", ATLAS_TARGET, Role.FACILITATOR),
            _preview("Decline assignment", ATLAS_TARGET, Role.FACILITATOR),
            _preview("Ask for clarification", "C01", Role.FACILITATOR),
        ),
        privacy_statement=(
            "Assignment data is session-scoped and exposes no ordinary profiles, photos, "
            "messages, sparks, or unrelated study records."
        ),
        accessibility_note=(
            "Text-label roles, render the run of show as a semantic list, and keep conflict "
            "and decline keyboard accessible."
        ),
        failure_exit_copy=(
            "Missing protocol, non-fixed timing, conflict, uncertain adult eligibility, or "
            "absent independence blocks acceptance."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="C02",
        role=Role.FACILITATOR,
        phase=Phase.LOBBY,
        title="Pre-room health and eligibility status",
        headline="Room readiness",
        summary="Arm one scheduled opening while every viewer’s own arm is checked independently.",
        status_text="Synthetic study · fictional people only · Opening not armed",
        cue_text="Minimum viewer gate: at least one valid armed viewer required.",
        content_blocks=(
            _block(
                "Prerequisite cards",
                "Featured participant, facilitator, adult, boundary, connection, and integrity gates.",
                "Pseudonymous rows: not armed, armed, withdrawn, disconnected, or invalid.",
            ),
            _block(
                "Atomic opening",
                "All valid armed viewers enter atomically at 7:30 PM.",
                "Excluded viewers get only Entry window closed or personal eligibility failure; the pair never opens late.",
            ),
        ),
        primary_actions=(
            _preview("Arm scheduled opening", "C02", Role.FACILITATOR),
        ),
        secondary_actions=(
            _preview("Disarm scheduled opening", "C02", Role.FACILITATOR),
            _preview("Publish replacement pair", "C02", Role.FACILITATOR),
            _preview("Keep room closed", ATLAS_TARGET, Role.FACILITATOR),
            _preview("Cancel circle", ATLAS_TARGET, Role.FACILITATOR),
            _navigate("Open protocol", "C01", Role.FACILITATOR),
        ),
        privacy_statement=(
            "Mara sees pseudonymous minimum readiness, not identity or ordinary content; "
            "Elias receives no count, exclusion, presence, or cancellation reason."
        ),
        accessibility_note=(
            "Announce rows, opening arm, minimum gate, and automatic transition to Mara "
            "without requiring a timestamp action."
        ),
        failure_exit_copy=(
            "Unarmed, withdrawn, disconnected, and invalid viewers do not block peers or "
            "receive room cancellation; zero valid means no viewer recipients."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=(
            _system(
                "Open at scheduled start",
                "C03",
                TransitionGuard.VALID_ARMED_START,
            ),
        ),
    ),
    Frame(
        id="C03",
        role=Role.FACILITATOR,
        phase=Phase.LIVE,
        title="Live facilitation console",
        headline="Current segment · fixed end 7:42 PM EDT",
        summary="Pace the room while deterministic terminal precedence remains explicit.",
        status_text="Synthetic study · fictional people only · Healthy live state",
        cue_text="C07 requires Mara’s confirmed safety termination; uncertainty closes through S01.",
        content_blocks=(
            _block(
                "Facilitation controls",
                "Advance or hold; cut mediated follow-up; shorten topic elaboration; use compact or neutral prompt.",
                "Select one-author question, relay one follow-up, pause, or explicitly end for safety.",
            ),
            _block(
                "Fixed-end precedence",
                "Mara-confirmed safety → C07; unconfirmed safety/integrity → S01.",
                "Otherwise known neutral → C08; only healthy normal state → C06.",
            ),
        ),
        primary_actions=(
            _preview("Begin next segment", "C03", Role.FACILITATOR),
        ),
        secondary_actions=(
            _preview("Hold this segment", "C03", Role.FACILITATOR),
            _navigate("Open private incident intake", "C04", Role.FACILITATOR),
            _preview("Pause room", "C05", Role.FACILITATOR),
            _preview(
                "End room",
                "C03",
                Role.FACILITATOR,
                TransitionGuard.MARA_CONFIRMED_SAFETY,
            ),
        ),
        privacy_statement=(
            "Mara sees only session pseudonyms, minimum status, submitted text, private "
            "author choice, and terminal provenance needed to facilitate."
        ),
        accessibility_note=(
            "Announce the selected terminal once; never announce Mara ended the room "
            "without her committed confirmation."
        ),
        failure_exit_copy=(
            "Failed or late safety confirmation cannot create C07. Unknown, paused, or "
            "unclassified state fails closed through S01."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=_fixed_end_system_transitions(),
    ),
    Frame(
        id="C04",
        role=Role.FACILITATOR,
        phase=Phase.SAFETY,
        title="Private incident intake",
        headline="Private concern from Cedar 4",
        summary="Receive and act on one session-specific concern without broad content access.",
        status_text="Synthetic study · fictional people only · Session-scoped intake",
        cue_text="Immediate room action may be needed only when the viewer marked urgency.",
        content_blocks=(
            _block(
                "Minimum intake",
                "Session pseudonym, concern category, viewer-provided text, current segment, and time.",
                "No media upload, ordinary-message browser, profile, photo library, or unrelated report.",
            ),
            _block(
                "Least-public options",
                "Acknowledge privately, ask one optional clarification, pause and assess, or end for safety.",
                "Decline or exit by the viewer creates no adverse inference.",
            ),
        ),
        primary_actions=(
            _preview("Acknowledge privately", "C04", Role.FACILITATOR),
            _preview("Pause and assess", "C05", Role.FACILITATOR),
        ),
        secondary_actions=(
            _preview(
                "Ask one session-scoped clarification in V08A",
                "V08A",
                Role.FACILITATOR,
            ),
            _preview(
                "End room",
                "C07",
                Role.FACILITATOR,
                TransitionGuard.MARA_CONFIRMED_SAFETY,
            ),
            _preview("Keep viewer exited", "C04", Role.FACILITATOR),
            _navigate("Open protocol", "C01", Role.FACILITATOR),
        ),
        privacy_statement=(
            "Only Mara sees the pseudonymous concern and optional answer; Elias and viewers "
            "receive no reporter, text, reason, or ordinary-content exposure."
        ),
        accessibility_note=(
            "State urgency in words, focus concern text after the heading, explain every "
            "control consequence, and issue at most one assertive alert."
        ),
        failure_exit_copy=(
            "If intake or clarification delivery is unavailable, Pause room, End room, "
            "and the viewer’s report/leave path remain available."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
    ),
    Frame(
        id="C05",
        role=Role.FACILITATOR,
        phase=Phase.LIVE,
        title="Facilitator pause state",
        headline="Mara paused the circle",
        summary="Stop social pressure while Mara assesses a boundary, health, or connection issue.",
        status_text="Synthetic study · fictional people only · Shared interaction paused",
        cue_text="The fixed scheduled end does not move.",
        content_blocks=(
            _block(
                "Role-specific pause",
                "Viewers may wait or Leave quietly; Elias may wait or End my participation.",
                "Mara alone sees the reason and may assess, resume, or confirm a safety end.",
            ),
            _block(
                "End boundary",
                "An unclassified pause still active at the scheduled end closes fail-closed through S01.",
                "Known neutral triggers use C08; only explicitly resumed healthy state can reach C06.",
            ),
        ),
        primary_actions=(
            _preview(
                "Resume with a boundary reminder",
                "C03",
                Role.FACILITATOR,
            ),
        ),
        secondary_actions=(
            _preview("Resume without comment", "C03", Role.FACILITATOR),
            _preview("Extend the pause", "C05", Role.FACILITATOR),
            _preview(
                "End room",
                "C05",
                Role.FACILITATOR,
                TransitionGuard.MARA_CONFIRMED_SAFETY,
            ),
        ),
        privacy_statement=(
            "Public pause copy gives no reason, reporter, viewer identity, count, or detail; "
            "Mara’s reason stays session-scoped."
        ),
        accessibility_note=(
            "Move focus once to the pause heading, announce the fixed-end rule, and leave "
            "all role-appropriate exit controls operable."
        ),
        failure_exit_copy=(
            "Confirmed safety routes C07; unresolved safety or control routes S01; a known "
            "neutral trigger routes C08; pause never defaults to C06."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.STANDARD_FLOW,
        system_transitions=_fixed_end_system_transitions(),
    ),
    Frame(
        id="C06",
        role=Role.FACILITATOR,
        phase=Phase.TERMINAL,
        title="Scheduled completion and role-specific exit",
        headline="Circle complete",
        summary="Acknowledge only a verified healthy normal completion at the automatic fixed end.",
        status_text="Synthetic study · fictional people only · Normal completion verified",
        cue_text="Shared interaction stopped automatically at the scheduled end after a resolved normal close.",
        content_blocks=(
            _block(
                "Healthy provenance",
                "No safety, integrity, neutral trigger, pause, or unknown state remains.",
                "No score, viewer count, incident field, applause, or automatic dating redirect.",
            ),
            _block(
                "Role-specific exits",
                "Viewer: private V11 debrief with optional later V12; Elias: F06 reflection.",
                "Mara: acknowledge completed circle; everyone may return to ordinary app.",
            ),
        ),
        primary_actions=(
            _navigate(
                "Continue to private debrief",
                "V11",
                Role.VIEWER,
                scope=ActionScope.LIVE_DERIVED_CONTINUATION,
            ),
            _navigate(
                "Continue to private reflection",
                "F06",
                Role.FEATURED_PARTICIPANT,
                scope=ActionScope.LIVE_DERIVED_CONTINUATION,
            ),
            _preview(
                "Acknowledge completed circle",
                "C06",
                Role.FACILITATOR,
            ),
        ),
        secondary_actions=(
            _preview("Return to ordinary app", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
            _preview(
                "Return to ordinary app",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
            _navigate("Open protocol notes", "C06", Role.FACILITATOR),
        ),
        privacy_statement=(
            "Routine completion reveals no viewer presence, exit, action, author, reflection, "
            "spark, standard-discovery information, ordinary profile, or message."
        ),
        accessibility_note=(
            "Announce automatic stop and verified normal provenance together, then move "
            "focus to role-appropriate closeout."
        ),
        failure_exit_copy=(
            "Failed closeout rendering cannot reopen the room. Only verified C06 provenance "
            "may permit V11’s guarded V12 continuation."
        ),
        terminal_class=TerminalClass.NORMAL_COMPLETION,
        continuation=ContinuationClass.NORMAL_COMPLETION_ONLY,
    ),
    Frame(
        id="C07",
        role=Role.FACILITATOR,
        phase=Phase.TERMINAL,
        title="Facilitator safety termination and closeout",
        headline="Mara ended the room",
        summary="Represent only a safety termination Mara explicitly confirmed and committed.",
        status_text="Synthetic study · fictional people only · Confirmed safety termination",
        cue_text="You can leave now.",
        content_blocks=(
            _block(
                "Commit boundary",
                "Only a successful Mara confirmation at or before the fixed boundary creates C07.",
                "Public copy gives no reason, reporter, allegation, viewer detail, or ordinary-content access.",
            ),
            _block(
                "No Live-derived continuation",
                "Viewers receive V11 closure debrief; Elias receives F06 closure reflection.",
                "This circle creates no V12 spark or profile-eligibility path.",
            ),
        ),
        primary_actions=(
            _preview(
                "Leave and open private debrief",
                "V11",
                Role.VIEWER,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _preview(
                "Leave and open private reflection",
                "F06",
                Role.FEATURED_PARTICIPANT,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _preview(
                "Close protocol incident",
                "C07",
                Role.FACILITATOR,
            ),
        ),
        secondary_actions=(
            _preview("Return to ordinary app", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Report a concern", "S02", Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
            _preview(
                "Return to ordinary app",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "C07 discloses only Mara’s confirmed termination, never the reason, reporter, "
            "ordinary profile, private message, spark, or reflection."
        ),
        accessibility_note=(
            "Name the destructive outcome in confirmation, separate cancel from end, and "
            "never announce Mara attribution without a committed confirmation."
        ),
        failure_exit_copy=(
            "Missing, failed, late, or unclassified confirmation cannot create C07 and "
            "must route S01 without Mara attribution."
        ),
        terminal_class=TerminalClass.SAFETY_TERMINATION,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
    Frame(
        id="C08",
        role=Role.FACILITATOR,
        phase=Phase.TERMINAL,
        title="Neutral trigger closure",
        headline="This circle is closed.",
        summary="Close atomically on a known neutral trigger without a facilitator timing click.",
        status_text="Synthetic study · fictional people only · Neutral closure committed automatically",
        cue_text="No cause, count, aggregate-zero, presence, identity, or blame is participant-facing.",
        content_blocks=(
            _block(
                "Known neutral provenance",
                "Featured voluntary exit, last-valid-viewer exit, or another classified neutral trigger.",
                "Mara alone may see trigger category and timestamp needed for closeout.",
            ),
            _block(
                "No Live-derived continuation",
                "Viewer V11 and Elias F06 are closure-only variants.",
                "No commit, resume, V12 spark, or profile-eligibility control exists.",
            ),
        ),
        primary_actions=(
            _navigate(
                "Open private closure reflection",
                "V11",
                Role.VIEWER,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _navigate(
                "Open private closure reflection",
                "F06",
                Role.FEATURED_PARTICIPANT,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _preview(
                "Acknowledge neutral closure",
                "C08",
                Role.FACILITATOR,
            ),
        ),
        secondary_actions=(
            _preview("Return to ordinary app", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _navigate("Open synthetic report preview", "S02", Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
            _preview(
                "Return to ordinary app",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "Participants see only identical cause-neutral copy; Mara alone may see the "
            "classified neutral trigger."
        ),
        accessibility_note=(
            "Announce automatic neutral closure and the identical participant sentence "
            "once, then focus untimed closeout."
        ),
        failure_exit_copy=(
            "Mara-confirmed safety at the same timestamp wins C07; safety or integrity "
            "uncertainty wins S01; C08 can never become C06."
        ),
        terminal_class=TerminalClass.NEUTRAL_CLOSURE,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
    Frame(
        id="S01",
        role=Role.CROSS_ROLE,
        phase=Phase.TERMINAL,
        title="Fail-closed integrity closure",
        headline="The system closed this circle",
        summary="Fail closed when required room control or a resolved safe state is unavailable.",
        status_text="Synthetic study · fictional people only · Integrity/control closure",
        cue_text="Mara ended the room is never shown for this state.",
        content_blocks=(
            _block(
                "System closure",
                "No speculative cause, reporter, viewer count, trigger, concern, or classification detail.",
                "The room cannot resume or become C07 or C06.",
            ),
            _block(
                "Closure-only options",
                "Viewers receive V11 closure options; Elias receives F06 closure reflection.",
                "No V12 spark, profile eligibility, or other Live-derived continuation exists.",
            ),
        ),
        primary_actions=(
            _navigate(
                "Open private closure options",
                "V11",
                Role.VIEWER,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _navigate(
                "Open private closure options",
                "F06",
                Role.FEATURED_PARTICIPANT,
                scope=ActionScope.CLOSURE_REFLECTION,
            ),
            _navigate("Open protocol review", "S01", Role.FACILITATOR),
        ),
        secondary_actions=(
            _preview("Return to ordinary app", ATLAS_TARGET, Role.VIEWER),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _navigate("Open synthetic report preview", "S02", Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
            _preview(
                "Return to ordinary app",
                ATLAS_TARGET,
                Role.FEATURED_PARTICIPANT,
            ),
        ),
        privacy_statement=(
            "System copy exposes no reporter, person, count, concern, trigger, or private "
            "classification and never implies Mara confirmed termination."
        ),
        accessibility_note=(
            "Announce system control loss, no-continuation scope, and ordinary navigation "
            "together without blame or private detail."
        ),
        failure_exit_copy=(
            "Unconfirmed safety, failed or late C07 confirmation, unresolved pause, or "
            "integrity uncertainty commits S01 and cannot be upgraded afterward."
        ),
        terminal_class=TerminalClass.INTEGRITY_CLOSURE,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
    Frame(
        id="S02",
        role=Role.CROSS_ROLE,
        phase=Phase.SAFETY,
        title="Synthetic report preview and confirmation",
        headline="Synthetic report preview",
        summary="Inspect a fictional evidence-selection flow without sending a real report.",
        status_text="Synthetic study · fictional people only · Nothing has been sent",
        cue_text="Choose exactly what this fictional preview would share.",
        content_blocks=(
            _block(
                "Exact share preview",
                "Select only circle context, submitted/shared text, and user-provided synthetic evidence.",
                "Exclude broad profiles, photo libraries, ordinary message history, reflections, and device browsing.",
            ),
            _block(
                "Synthetic confirmation",
                "Synthetic confirmation — nothing was sent and no operational case exists.",
                "No case ID, delivery, review, response, operational report, or operator access is fabricated.",
            ),
        ),
        primary_actions=(
            _preview("Confirm synthetic preview", "S02", Role.CROSS_ROLE),
        ),
        secondary_actions=(
            _preview("Remove selected item", "S02", Role.CROSS_ROLE),
            _preview("Cancel", ATLAS_TARGET, Role.CROSS_ROLE),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _preview("Hide Live Introductions", "S03", Role.VIEWER),
            _preview("Exit", ATLAS_TARGET, Role.CROSS_ROLE),
        ),
        privacy_statement=(
            "No reporter identity, target identity, ordinary profile, message, "
            "or role-specific control is exposed."
        ),
        accessibility_note=(
            "Identify this as a neutral fallback and provide no preselected "
            "product role."
        ),
        failure_exit_copy=(
            "Nothing is sent; return through ordinary static navigation."
        ),
        terminal_class=TerminalClass.NON_TERMINAL,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
    Frame(
        id="S03",
        role=Role.CROSS_ROLE,
        phase=Phase.SAFETY,
        title="Hide Live Introductions",
        headline="Live Introductions is hidden",
        summary="Hide only Live surfaces and invitations until deliberate re-entry.",
        status_text="Synthetic study · fictional people only · Feature-local hidden state",
        cue_text="This is not a block, report, deletion, connection control, or app-wide emergency action.",
        content_blocks=(
            _block(
                "Live-only effect",
                "Leave the current Live surface and suppress Live invitations, reminders, and pending Live states.",
                "Already shared, displayed, remembered, or externally captured content cannot be erased.",
            ),
            _block(
                "Separate controls",
                "This does not automatically block, report, close an ordinary connection, or change unrelated discovery.",
                "Any broader Emergency privacy control keeps its existing app-wide semantics.",
            ),
        ),
        primary_actions=(
            _preview("Hide Live Introductions", "S03", Role.CROSS_ROLE),
        ),
        secondary_actions=(
            _preview("Return to ordinary app", ATLAS_TARGET, Role.CROSS_ROLE),
            _preview("Keep Live Introductions hidden", "S03", Role.CROSS_ROLE),
            _preview("Block Elias", ATLAS_TARGET, Role.VIEWER),
            _navigate("Open synthetic report preview", "S02", Role.CROSS_ROLE),
            _preview(
                "Manage ordinary connection",
                ATLAS_TARGET,
                Role.CROSS_ROLE,
                audiences=PARTICIPANT_ROLES,
            ),
            _navigate("Review deliberate re-entry", "V01", Role.VIEWER),
        ),
        privacy_statement=(
            "Hiding creates no public notice, reporter identity, reason, viewer signal, "
            "automatic report, or ordinary-connection change."
        ),
        accessibility_note=(
            "Announce effect and limits together, focus the confirmation heading, and keep "
            "block, report preview, connection management, and exit distinctly labeled."
        ),
        failure_exit_copy=(
            "Live participation stays fail-closed while uncertain; Return to ordinary app "
            "remains available and re-entry is never automatic."
        ),
        terminal_class=TerminalClass.FEATURE_HIDDEN,
        continuation=ContinuationClass.NO_LIVE_CONTINUATION,
    ),
)

_RAW_FRAME_BY_ID = MappingProxyType({frame.id: frame for frame in _RAW_FRAMES})
_ROOM_SEGMENTS = (
    "Arrival",
    "Small rituals",
    "Curiosity",
    "Gentle turn",
    "Values",
    "Closing",
)


def _choice_group(
    legend: str,
    *labels: str,
    input_kind: ChoiceInputKind = ChoiceInputKind.RADIO,
    selected: int | None = None,
) -> ChoiceGroupData:
    return ChoiceGroupData(
        legend=legend,
        input_kind=input_kind,
        options=tuple(
            ChoiceOptionData(
                value=f"choice-{index + 1}",
                label=label,
                selected=index == selected,
            )
            for index, label in enumerate(labels)
        ),
    )


def _panels(*items: tuple[str, tuple[str, ...]]) -> tuple[PanelData, ...]:
    return tuple(PanelData(heading=heading, body=body) for heading, body in items)


def _presentation(
    frame_id: str,
    kind: SurfaceKind,
    context: SurfaceContext,
    audience: Role,
    *,
    brand_label: str = "Live Introductions",
    eyebrow: str | None = None,
    heading: str | None = None,
    summary: str | None = None,
    statuses: tuple[StatusData, ...] | None = None,
    panels: tuple[PanelData, ...] | None = None,
    current_shell: ShellAction | None = None,
    control_audiences: tuple[Role, ...] = (),
    choice_groups: tuple[ChoiceGroupData, ...] = (),
    profile: ProfileData | None = None,
    conversation: ConversationData | None = None,
    text_controls: tuple[TextControlData, ...] = (),
    evidence: EvidenceData | None = None,
    contract: ContractData | None = None,
) -> SurfacePresentation:
    frame = _RAW_FRAME_BY_ID[frame_id]
    return SurfacePresentation(
        kind=kind,
        context=context,
        audience=audience,
        brand_label=brand_label,
        eyebrow=eyebrow or frame.phase.value.replace("_", " "),
        heading=heading or frame.headline,
        summary=summary or frame.summary,
        statuses=statuses
        or (
            StatusData("Current state", frame.status_text, current=True),
            StatusData("Boundary", frame.cue_text),
        ),
        panels=panels
        or tuple(
            PanelData(heading=block.heading, body=block.body)
            for block in frame.content_blocks
        ),
        current_shell=current_shell,
        control_audiences=control_audiences,
        choice_groups=choice_groups,
        profile=profile,
        conversation=conversation,
        text_controls=text_controls,
        evidence=evidence,
        contract=contract
        or ContractData(
            privacy=frame.privacy_statement,
            accessibility=frame.accessibility_note,
            failure_exit=frame.failure_exit_copy,
        ),
    )


_PRESENTATION_BY_ID = MappingProxyType(
    {
        "V01": _presentation(
            "V01",
            SurfaceKind.VIEWER_CONSENT,
            SurfaceContext.STUDY_ENTRY,
            Role.VIEWER,
            eyebrow="Voluntary preview",
            choice_groups=(
                _choice_group(
                    "Consent acknowledgements",
                    "I understand this is a fictional static preview",
                    "I understand that joining grants no contact or romantic permission",
                    input_kind=ChoiceInputKind.CHECKBOX,
                ),
            ),
        ),
        "V02": _presentation(
            "V02",
            SurfaceKind.VIEWER_ADULT_STATUS,
            SurfaceContext.STUDY_ENTRY,
            Role.VIEWER,
            eyebrow="Adult eligibility",
            statuses=(
                StatusData("Required age", "18 or older"),
                StatusData("Eligibility", "Not established in this prototype", current=True),
            ),
        ),
        "V03": _presentation(
            "V03",
            SurfaceKind.VIEWER_PREFERENCES,
            SurfaceContext.STUDY_ENTRY,
            Role.VIEWER,
            eyebrow="Invitation defaults",
            choice_groups=(
                _choice_group("Tone", "Warm", "Direct", "Quiet", selected=2),
                _choice_group("Pacing", "Slower", "Balanced", "Brisk", selected=1),
                _choice_group(
                    "Question comfort",
                    "Anonymous questions are welcome",
                    "Prompt cards only",
                    selected=0,
                ),
            ),
        ),
        "V04": _presentation(
            "V04",
            SurfaceKind.VIEWER_INVITATIONS,
            SurfaceContext.STUDY_ENTRY,
            Role.VIEWER,
            eyebrow="Scheduled invitations",
            statuses=(
                StatusData("Tonight", "7:30–7:42 PM EDT", current=True),
                StatusData("Format", "Invite only · fixed end"),
            ),
        ),
        "V05": _presentation(
            "V05",
            SurfaceKind.VIEWER_INVITATION_DETAIL,
            SurfaceContext.STUDY_ENTRY,
            Role.VIEWER,
            eyebrow="Invitation detail",
            profile=ProfileData(
                name="Elias, 29",
                subtitle="Fictional featured participant",
                facts=(
                    "Library-program coordinator",
                    "Repairs old radios",
                    "Learning sourdough",
                ),
                bio="A bounded introduction hosted by Mara with no direct contact exchange.",
            ),
        ),
        "V06": _presentation(
            "V06",
            SurfaceKind.VIEWER_BRIEFING,
            SurfaceContext.LIVE_ROOM,
            Role.VIEWER,
            eyebrow="Before joining",
            choice_groups=(
                _choice_group(
                    "Briefing acknowledgement",
                    "I understand the camera and microphone stay off",
                    "I understand external capture cannot be prevented",
                    input_kind=ChoiceInputKind.CHECKBOX,
                ),
            ),
        ),
        "V07": _presentation(
            "V07",
            SurfaceKind.VIEWER_LOBBY,
            SurfaceContext.LIVE_ROOM,
            Role.VIEWER,
            eyebrow="Private lobby",
            statuses=(
                StatusData("Room", "Waiting for the fixed start", current=True),
                StatusData("You", "Camera off · microphone off"),
                StatusData("Privacy", "No participant roster"),
            ),
        ),
        "V08": _presentation(
            "V08",
            SurfaceKind.VIEWER_LIVE_ROOM,
            SurfaceContext.LIVE_ROOM,
            Role.VIEWER,
            eyebrow="Live room",
            conversation=ConversationData(
                label="Facilitated conversation",
                messages=(
                    ConversationMessageData(
                        "Mara",
                        "Elias, tell us about a small ritual that makes a place feel like home.",
                        "7:34 PM",
                    ),
                    ConversationMessageData(
                        "Elias",
                        "Saturday radio repair, bread cooling, and the library doors opening.",
                        "7:35 PM",
                    ),
                ),
                segments=_ROOM_SEGMENTS,
                current_segment=2,
            ),
        ),
        "V08A": _presentation(
            "V08A",
            SurfaceKind.VIEWER_SAFETY_CLARIFICATION,
            SurfaceContext.SAFETY,
            Role.VIEWER,
            eyebrow="Private clarification",
            conversation=ConversationData(
                label="Private facilitator note",
                messages=(
                    ConversationMessageData(
                        "Mara",
                        "Would a pause or a neutral exit feel better right now?",
                    ),
                ),
            ),
            choice_groups=(
                _choice_group("Private response", "Pause", "Neutral exit", "No response"),
            ),
        ),
        "V09": _presentation(
            "V09",
            SurfaceKind.VIEWER_TOPIC_CHOICE,
            SurfaceContext.LIVE_ROOM,
            Role.VIEWER,
            eyebrow="Private topic shelf",
            choice_groups=(
                _choice_group(
                    "Choose one topic",
                    "A place that shaped you",
                    "A tiny daily ritual",
                    "Something you are learning",
                    "Skip this choice",
                ),
            ),
        ),
        "V10": _presentation(
            "V10",
            SurfaceKind.VIEWER_QUESTION,
            SurfaceContext.LIVE_ROOM,
            Role.VIEWER,
            eyebrow="Anonymous question",
            text_controls=(
                TextControlData(
                    "Question for Mara to read",
                    "What kind of community project would you enjoy starting?",
                    multiline=True,
                ),
            ),
        ),
        "V11": _presentation(
            "V11",
            SurfaceKind.VIEWER_DEBRIEF,
            SurfaceContext.NORMAL_COMPLETION,
            Role.VIEWER,
            eyebrow="Private debrief",
            choice_groups=(
                _choice_group(
                    "How settled do you feel?",
                    "Settled",
                    "Unsure",
                    "Activated",
                    "Prefer not to say",
                ),
                _choice_group(
                    "Were your boundaries respected?",
                    "Yes",
                    "Not sure",
                    "No",
                ),
            ),
            text_controls=(
                TextControlData("Private note", "Optional and visible only here", multiline=True),
            ),
        ),
        "V12": _presentation(
            "V12",
            SurfaceKind.VIEWER_SPARK,
            SurfaceContext.NORMAL_COMPLETION,
            Role.VIEWER,
            eyebrow="Sealed interest",
            choice_groups=(
                _choice_group(
                    "Private spark choice",
                    "Send a spark",
                    "Not now",
                    "No spark",
                ),
            ),
        ),
        "V13": _presentation(
            "V13",
            SurfaceKind.VIEWER_SPARK_SEALED,
            SurfaceContext.NORMAL_COMPLETION,
            Role.VIEWER,
            eyebrow="Sealed state",
            statuses=(
                StatusData("Spark", "Sealed · not disclosed", current=True),
                StatusData("Profile eligibility", "Optional and separate"),
                StatusData("Expiry", "July 30, 2026 · 7:42 PM EDT"),
            ),
            choice_groups=(
                _choice_group(
                    "Ordinary profile eligibility",
                    "Allow delayed ordinary eligibility",
                    "Do not allow",
                ),
            ),
        ),
        "V14": _presentation(
            "V14",
            SurfaceKind.VIEWER_RECIPROCAL_OUTCOME,
            SurfaceContext.NORMAL_COMPLETION,
            Role.VIEWER,
            eyebrow="Private mutual outcome",
            statuses=(
                StatusData("Outcome", "Reciprocal interest confirmed", current=True),
                StatusData("Messaging", "Closed until separate permission"),
            ),
        ),
        "V15": _presentation(
            "V15",
            SurfaceKind.VIEWER_NO_OUTCOME,
            SurfaceContext.NO_LIVE_CONTINUATION,
            Role.VIEWER,
            eyebrow="Private outcome",
            statuses=(
                StatusData("Outcome", "No reciprocal interest confirmed", current=True),
                StatusData("Continuation", "None from this circle"),
            ),
        ),
        "V16": _presentation(
            "V16",
            SurfaceKind.VIEWER_CONNECTION_PERMISSION,
            SurfaceContext.PRIVATE_POST_ROOM,
            Role.VIEWER,
            eyebrow="Text permission",
            choice_groups=(
                _choice_group(
                    "Text-only connection",
                    "Allow text messages",
                    "Not now",
                    "Do not connect",
                ),
            ),
        ),
        "V17": _presentation(
            "V17",
            SurfaceKind.VIEWER_CONVERSATION,
            SurfaceContext.PRIVATE_POST_ROOM,
            Role.VIEWER,
            eyebrow="Private conversation",
            conversation=ConversationData(
                label="Text-only conversation",
                messages=(
                    ConversationMessageData(
                        "Elias",
                        "I liked your question about community projects.",
                        "9:14 AM",
                    ),
                    ConversationMessageData(
                        "You",
                        "The library repair table sounded genuinely lovely.",
                        "9:22 AM",
                    ),
                ),
            ),
            text_controls=(
                TextControlData("Message composer", "Messaging is inactive in this prototype"),
            ),
        ),
        "V18": _presentation(
            "V18",
            SurfaceKind.VIEWER_MEETING_READINESS,
            SurfaceContext.PRIVATE_POST_ROOM,
            Role.VIEWER,
            eyebrow="Meeting readiness",
            choice_groups=(
                _choice_group(
                    "How do you feel?",
                    "Open to discussing",
                    "Not yet",
                    "No meeting",
                ),
            ),
        ),
        "V19": _presentation(
            "V19",
            SurfaceKind.VIEWER_MEETING_PLAN,
            SurfaceContext.PRIVATE_POST_ROOM,
            Role.VIEWER,
            eyebrow="Mutual readiness",
            choice_groups=(
                _choice_group(
                    "Revalidate readiness",
                    "Still open to discussing",
                    "Pause planning",
                    "No meeting",
                ),
            ),
            text_controls=(
                TextControlData("Public-place idea", "Daytime café near a transit hub"),
            ),
        ),
        "F01": _presentation(
            "F01",
            SurfaceKind.FEATURED_VERIFICATION,
            SurfaceContext.STUDY_ENTRY,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Participation status",
            statuses=(
                StatusData("Adult eligibility", "Verified for this fictional preview", current=True),
                StatusData("Identity", "Verification has limited scope"),
                StatusData("Training", "Required before the room"),
            ),
        ),
        "F02": _presentation(
            "F02",
            SurfaceKind.FEATURED_TRAINING,
            SurfaceContext.STUDY_ENTRY,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Policy training",
            choice_groups=(
                _choice_group(
                    "Training acknowledgements",
                    "No viewer roster or direct contact",
                    "Mara controls pacing and safety",
                    "External capture cannot be prevented",
                    input_kind=ChoiceInputKind.CHECKBOX,
                ),
            ),
        ),
        "F03": _presentation(
            "F03",
            SurfaceKind.FEATURED_REHEARSAL,
            SurfaceContext.STUDY_ENTRY,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Media rehearsal",
            statuses=(
                StatusData("Camera", "Framing preview only", current=True),
                StatusData("Microphone", "Level preview only"),
                StatusData("Prompt", "Practice without performance scoring"),
            ),
            text_controls=(
                TextControlData(
                    "Practice answer",
                    "A small ritual that makes a place feel like home.",
                    multiline=True,
                ),
            ),
        ),
        "F04": _presentation(
            "F04",
            SurfaceKind.FEATURED_GREENROOM,
            SurfaceContext.LIVE_ROOM,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Greenroom",
            statuses=(
                StatusData("Schedule", "7:30–7:42 PM EDT", current=True),
                StatusData("Facilitator", "Mara"),
                StatusData("Audience", "Invite only · no roster"),
            ),
        ),
        "F05": _presentation(
            "F05",
            SurfaceKind.FEATURED_LIVE_ROOM,
            SurfaceContext.LIVE_ROOM,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Live participant view",
            conversation=ConversationData(
                label="Facilitated conversation",
                messages=(
                    ConversationMessageData(
                        "Mara",
                        "Take your time. What is a place you return to in your mind?",
                        "7:35 PM",
                    ),
                    ConversationMessageData(
                        "Elias",
                        "The repair table at the library on Saturday mornings.",
                        "7:36 PM",
                    ),
                ),
                segments=_ROOM_SEGMENTS,
                current_segment=2,
            ),
        ),
        "F06": _presentation(
            "F06",
            SurfaceKind.FEATURED_REFLECTION,
            SurfaceContext.NORMAL_COMPLETION,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Private reflection",
            choice_groups=(
                _choice_group(
                    "Did you feel able to be yourself?",
                    "Yes",
                    "Partly",
                    "No",
                    "Skip",
                ),
                _choice_group(
                    "Did you respect the stated boundaries?",
                    "Yes",
                    "Not sure",
                    "No",
                ),
            ),
            text_controls=(
                TextControlData("Private note", "Optional reflection", multiline=True),
            ),
        ),
        "F07": _presentation(
            "F07",
            SurfaceKind.FEATURED_CANDIDATE_PROFILE,
            SurfaceContext.ORDINARY_APP,
            Role.FEATURED_PARTICIPANT,
            brand_label="Ordinary discovery",
            eyebrow="Ordinary candidate",
            heading="One ordinary candidate",
            summary="A fictional candidate shown after sufficient delay and mixing.",
            statuses=(
                StatusData("Source", "Ordinary discovery only", current=True),
                StatusData("Decision", "No incoming-interest signal"),
            ),
            panels=_panels(
                (
                    "Decision boundary",
                    (
                        "Interested, Not now, and Pass receive equal treatment.",
                        "Recognition or inference cannot be guaranteed away.",
                    ),
                ),
            ),
            profile=ProfileData(
                name="Nora, 28",
                subtitle="Museum educator",
                facts=("Sunday markets", "Ceramics class", "Neighborhood walks"),
                bio="Looking for a thoughtful conversation and a slow first meeting.",
            ),
            choice_groups=(
                _choice_group("Candidate decision", "Interested", "Not now", "Pass"),
            ),
            contract=ContractData(
                privacy="The profile owner receives no source label, incoming-interest signal, order cue, or analytics.",
                accessibility="Use one semantic profile region with equally presented decision choices.",
                failure_exit="An unavailable candidate returns to ordinary discovery without exposing a reason.",
            ),
        ),
        "F08": _presentation(
            "F08",
            SurfaceKind.FEATURED_CONNECTION,
            SurfaceContext.ORDINARY_APP,
            Role.FEATURED_PARTICIPANT,
            brand_label="Ordinary discovery",
            eyebrow="Private mutual outcome",
            heading="Reciprocal interest confirmed",
            summary="Two independent active interests aligned; messages still require permission.",
            statuses=(
                StatusData("Outcome", "Mutual interest", current=True),
                StatusData("Messages", "Closed until separate permission"),
            ),
            panels=_panels(
                (
                    "Private permission",
                    (
                        "No new profile exchange or source context is added.",
                        "Media, location, contact, calendar, and presence remain unavailable.",
                    ),
                ),
            ),
            choice_groups=(
                _choice_group(
                    "Connection choice",
                    "Allow text messages",
                    "Not now",
                    "Do not connect",
                ),
            ),
            contract=ContractData(
                privacy="Permission exchanges no profile, source history, reason, or real message.",
                accessibility="Read the qualified outcome and preselect no permission choice.",
                failure_exit="Pending or withdrawn permission keeps messaging closed.",
            ),
        ),
        "C01": _presentation(
            "C01",
            SurfaceKind.FACILITATOR_ASSIGNMENT,
            SurfaceContext.FACILITATOR,
            Role.FACILITATOR,
            eyebrow="Assignment",
            statuses=(
                StatusData("Circle", "Assigned", current=True),
                StatusData("Fixed window", "7:30–7:42 PM EDT"),
                StatusData("Authority", "Independent facilitation"),
            ),
            choice_groups=(
                _choice_group(
                    "Assignment decision",
                    "Accept assignment",
                    "Declare a conflict",
                    "Decline assignment",
                ),
            ),
        ),
        "C02": _presentation(
            "C02",
            SurfaceKind.FACILITATOR_READINESS,
            SurfaceContext.FACILITATOR,
            Role.FACILITATOR,
            eyebrow="Readiness checklist",
            choice_groups=(
                _choice_group(
                    "Required readiness",
                    "Adult eligibility established",
                    "Fixed timing healthy",
                    "Safety controls available",
                    "No active conflict",
                    input_kind=ChoiceInputKind.CHECKBOX,
                    selected=0,
                ),
            ),
        ),
        "C03": _presentation(
            "C03",
            SurfaceKind.FACILITATOR_CONSOLE,
            SurfaceContext.FACILITATOR,
            Role.FACILITATOR,
            eyebrow="Facilitation console",
            conversation=ConversationData(
                label="Current room transcript preview",
                messages=(
                    ConversationMessageData("Mara", "We are moving into curiosity.", "7:34 PM"),
                    ConversationMessageData("Elias", "The library repair table.", "7:35 PM"),
                ),
                segments=_ROOM_SEGMENTS,
                current_segment=2,
            ),
        ),
        "C04": _presentation(
            "C04",
            SurfaceKind.FACILITATOR_INCIDENT,
            SurfaceContext.SAFETY,
            Role.FACILITATOR,
            eyebrow="Private incident",
            statuses=(
                StatusData("Reporter", "Cedar 4 · session pseudonym", current=True),
                StatusData("Visibility", "Mara only"),
            ),
            text_controls=(
                TextControlData(
                    "Private concern",
                    "The last answer crossed the boundary I selected.",
                    multiline=True,
                ),
            ),
        ),
        "C05": _presentation(
            "C05",
            SurfaceKind.FACILITATOR_PAUSE,
            SurfaceContext.FACILITATOR,
            Role.FACILITATOR,
            eyebrow="Paused state",
            statuses=(
                StatusData("Room", "Paused by Mara", current=True),
                StatusData("Fixed end", "Still 7:42 PM EDT"),
                StatusData("Participant copy", "Cause neutral"),
            ),
        ),
        "C06": _presentation(
            "C06",
            SurfaceKind.FACILITATOR_COMPLETION,
            SurfaceContext.NORMAL_COMPLETION,
            Role.FACILITATOR,
            eyebrow="Scheduled completion",
            statuses=(
                StatusData("Room", "Complete", current=True),
                StatusData("End", "7:42 PM EDT"),
                StatusData("Continuation", "Private role-specific exits"),
            ),
        ),
        "C07": _presentation(
            "C07",
            SurfaceKind.FACILITATOR_TERMINATION,
            SurfaceContext.NO_LIVE_CONTINUATION,
            Role.FACILITATOR,
            eyebrow="Safety termination",
            control_audiences=(
                Role.VIEWER,
                Role.FEATURED_PARTICIPANT,
                Role.FACILITATOR,
            ),
            panels=_panels(
                (
                    "Final state",
                    (
                        "Mara confirmed and committed a safety termination.",
                        "No reason, reporter, allegation, or private detail is disclosed.",
                    ),
                ),
                (
                    "Inline private closure",
                    (
                        "Viewer debrief and featured-participant reflection remain on this page.",
                        "No interest, profile, message, meeting, or location continuation exists.",
                    ),
                ),
            ),
        ),
        "C08": _presentation(
            "C08",
            SurfaceKind.FACILITATOR_NEUTRAL_CLOSURE,
            SurfaceContext.NO_LIVE_CONTINUATION,
            Role.FACILITATOR,
            eyebrow="Neutral closure",
            control_audiences=(
                Role.VIEWER,
                Role.FEATURED_PARTICIPANT,
                Role.FACILITATOR,
            ),
            panels=_panels(
                (
                    "Cause-neutral state",
                    (
                        "A classified neutral trigger closed the fictional circle.",
                        "Participants receive no trigger category or private detail.",
                    ),
                ),
                (
                    "Inline private closure",
                    (
                        "Role-specific reflection remains on this page.",
                        "No interest, profile, message, meeting, or location continuation exists.",
                    ),
                ),
            ),
        ),
        "S01": _presentation(
            "S01",
            SurfaceKind.INTEGRITY_CLOSURE,
            SurfaceContext.NO_LIVE_CONTINUATION,
            Role.FACILITATOR,
            eyebrow="Integrity closure",
            control_audiences=(
                Role.VIEWER,
                Role.FEATURED_PARTICIPANT,
                Role.FACILITATOR,
            ),
            panels=_panels(
                (
                    "Fail-closed state",
                    (
                        "Required control or a resolved safe state was unavailable.",
                        "No speculative cause, reporter, count, trigger, or blame is shown.",
                    ),
                ),
                (
                    "Inline private closure",
                    (
                        "Role-specific reflection remains on this page.",
                        "No interest, profile, message, meeting, or location continuation exists.",
                    ),
                ),
            ),
        ),
        "S02": _presentation(
            "S02",
            SurfaceKind.SAFETY_REPORT,
            SurfaceContext.SAFETY,
            Role.CROSS_ROLE,
            brand_label="Safety preview",
            eyebrow="Neutral fallback",
            heading="Synthetic report preview",
            summary=(
                "A neutral directly addressable fallback with no role-specific "
                "person, connection, or facilitator controls."
            ),
            statuses=(
                StatusData("Submission", "Nothing has been sent", current=True),
                StatusData("Audience", "No product role selected"),
            ),
            current_shell=ShellAction(
                kind=ShellActionKind.SAFETY,
                label="Safety",
                target_id="S02",
                audiences=frozenset({Role.CROSS_ROLE}),
            ),
            panels=_panels(
                (
                    "Choose from product context",
                    (
                        "Viewer, featured-participant, and facilitator surfaces use separate static destinations.",
                        "This fallback exposes no personal block, feature-hide, or protocol action.",
                    ),
                ),
            ),
            evidence=EvidenceData(
                legend="Generic evidence preview",
                options=(
                    EvidenceOptionData("context", "Visible product context", selected=True),
                    EvidenceOptionData("note", "User-provided note"),
                ),
            ),
            text_controls=(
                TextControlData(
                    "Synthetic note",
                    "Nothing entered here is sent or saved.",
                    multiline=True,
                ),
            ),
            contract=ContractData(
                privacy="No reporter identity, target identity, ordinary profile, message, or role-specific control is exposed.",
                accessibility="Identify this as a neutral fallback and provide no preselected product role.",
                failure_exit="Nothing is sent; return through ordinary static navigation.",
            ),
        ),
        "S03": _presentation(
            "S03",
            SurfaceKind.HIDE_LIVE,
            SurfaceContext.SAFETY,
            Role.VIEWER,
            eyebrow="Feature visibility",
            statuses=(
                StatusData("Live invitations", "Hidden", current=True),
                StatusData("Ordinary app", "Unchanged"),
                StatusData("Re-entry", "Deliberate only"),
            ),
        ),
    }
)
_FRAMES = tuple(
    replace(frame, presentation=_PRESENTATION_BY_ID[frame.id])
    for frame in _RAW_FRAMES
)
_BASE_FRAME_BY_ID = MappingProxyType({frame.id: frame for frame in _FRAMES})
_SAFETY_REPORT_PRESENTATION_BY_ROLE = MappingProxyType(
    {
        Role.VIEWER: _presentation(
            "S02",
            SurfaceKind.SAFETY_REPORT_VIEWER,
            SurfaceContext.SAFETY,
            Role.VIEWER,
            eyebrow="Viewer safety preview",
            heading="Synthetic viewer report preview",
            summary="Choose only fictional room context visible to this viewer; nothing is sent.",
            statuses=(
                StatusData("Submission", "Nothing has been sent", current=True),
                StatusData("Target", "Elias · currently visible featured participant"),
            ),
            panels=_panels(
                (
                    "Viewer-only boundary",
                    (
                        "Block Elias and Hide Live Introductions remain viewer-only preview controls.",
                        "No featured-participant or facilitator action is shown.",
                    ),
                ),
            ),
            evidence=EvidenceData(
                legend="Viewer evidence preview",
                options=(
                    EvidenceOptionData("prompt", "Prompt or topic shown", selected=True),
                    EvidenceOptionData("caption", "Relevant caption excerpt"),
                    EvidenceOptionData("timing", "Approximate segment timing"),
                ),
            ),
            text_controls=(
                TextControlData(
                    "What happened",
                    "Describe only what is needed for this synthetic preview.",
                    multiline=True,
                ),
            ),
            contract=ContractData(
                privacy=(
                    "Only viewer-selected fictional room context appears. Elias "
                    "receives no report notice, viewer identity, private note, "
                    "or operational case."
                ),
                accessibility=(
                    "Name Elias as the fictional visible subject, preserve "
                    "evidence labels and selection state, and keep block, hide, "
                    "cancel, and exit distinct."
                ),
                failure_exit=(
                    "If the viewer preview is unavailable, nothing is sent or "
                    "saved; block, hide, cancel, and exit previews remain independent."
                ),
            ),
        ),
        Role.FEATURED_PARTICIPANT: _presentation(
            "S02",
            SurfaceKind.SAFETY_REPORT_FEATURED,
            SurfaceContext.SAFETY,
            Role.FEATURED_PARTICIPANT,
            eyebrow="Featured-participant safety preview",
            heading="Synthetic featured-participant report preview",
            summary=(
                "Preview only content this participant can legitimately see; "
                "nothing is sent."
            ),
            statuses=(
                StatusData("Submission", "Nothing has been sent", current=True),
                StatusData(
                    "Target scope",
                    "Current visible ordinary candidate or connection only",
                ),
            ),
            panels=_panels(
                (
                    "Target boundary",
                    (
                        "No viewer identity, roster, pseudonym, or private viewer control is available.",
                        "A candidate or connection may be referenced only when already visible in ordinary context.",
                    ),
                ),
            ),
            evidence=EvidenceData(
                legend="Featured-participant evidence preview",
                options=(
                    EvidenceOptionData("own-answer", "Your submitted answer", selected=True),
                    EvidenceOptionData("prompt", "Facilitator prompt shown to you"),
                    EvidenceOptionData(
                        "ordinary-context",
                        "Visible ordinary candidate or connection, when present",
                    ),
                ),
            ),
            text_controls=(
                TextControlData(
                    "What happened",
                    "Describe only content already visible to you.",
                    multiline=True,
                ),
            ),
            contract=ContractData(
                privacy=(
                    "Only the featured participant's own visible content and any "
                    "ordinary candidate or connection already visible to them may "
                    "appear; no viewer identity, roster, or pseudonym is available."
                ),
                accessibility=(
                    "Name the featured-participant scope and expose candidate or "
                    "connection evidence only when that ordinary context is already visible."
                ),
                failure_exit=(
                    "If no ordinary candidate or connection is visible, omit that "
                    "evidence; nothing is sent or saved and cancel and exit remain available."
                ),
            ),
        ),
        Role.FACILITATOR: _presentation(
            "S02",
            SurfaceKind.SAFETY_REPORT_FACILITATOR,
            SurfaceContext.SAFETY,
            Role.FACILITATOR,
            eyebrow="Facilitator safety preview",
            heading="Synthetic facilitator incident preview",
            summary=(
                "Preview minimum pseudonymous protocol evidence without a "
                "personal block or participant-profile action."
            ),
            statuses=(
                StatusData("Submission", "Nothing has been sent", current=True),
                StatusData("Authority", "Protocol-scoped only"),
            ),
            panels=_panels(
                (
                    "Facilitator boundary",
                    (
                        "No personal block, feature-hide, ordinary profile, or private participant content is available.",
                        "Only minimum pseudonymous incident and protocol context may be previewed.",
                    ),
                ),
            ),
            evidence=EvidenceData(
                legend="Facilitator evidence preview",
                options=(
                    EvidenceOptionData(
                        "incident",
                        "Pseudonymous incident intake",
                        selected=True,
                    ),
                    EvidenceOptionData("timing", "Approximate segment timing"),
                    EvidenceOptionData("protocol", "Facilitator action or protocol state"),
                ),
            ),
            text_controls=(
                TextControlData(
                    "Protocol note",
                    "No personal report or operational case is created.",
                    multiline=True,
                ),
            ),
            contract=ContractData(
                privacy=(
                    "Only minimum pseudonymous incident and protocol context may "
                    "appear; no personal block, ordinary profile, viewer roster, "
                    "or private reflection is available."
                ),
                accessibility=(
                    "Name the protocol-scoped authority, preserve pseudonymous "
                    "evidence labels, and distinguish protocol review from "
                    "confirmation and exit."
                ),
                failure_exit=(
                    "If the facilitator preview is unavailable, nothing is sent "
                    "or saved, room control is unchanged, and protocol review and "
                    "exit remain available."
                ),
            ),
        ),
    }
)


def _safety_report_variant_actions(
    destination: str,
    role: Role,
) -> tuple[tuple[Action, ...], tuple[Action, ...]]:
    primary = (_preview("Confirm synthetic preview", destination, role),)
    secondary = (
        _preview("Remove selected item", destination, role),
        _preview("Cancel", ATLAS_TARGET, role),
    )
    if role is Role.VIEWER:
        secondary += (
            _preview("Block Elias", ATLAS_TARGET, role),
            _preview("Hide Live Introductions", "S03", role),
        )
    elif role is Role.FACILITATOR:
        secondary += (
            _navigate(
                "Open protocol review",
                "C01",
                role,
            ),
        )
    secondary += (_preview("Exit", ATLAS_TARGET, role),)
    return primary, secondary


_SAFETY_REPORT_FRAMES = tuple(
    replace(
        _BASE_FRAME_BY_ID["S02"],
        id=destination,
        role=role,
        title=f"Synthetic report preview · {role.value.replace('_', ' ')}",
        primary_actions=_safety_report_variant_actions(destination, role)[0],
        secondary_actions=_safety_report_variant_actions(destination, role)[1],
        privacy_statement=_SAFETY_REPORT_PRESENTATION_BY_ROLE[
            role
        ].contract.privacy,
        accessibility_note=_SAFETY_REPORT_PRESENTATION_BY_ROLE[
            role
        ].contract.accessibility,
        failure_exit_copy=_SAFETY_REPORT_PRESENTATION_BY_ROLE[
            role
        ].contract.failure_exit,
        system_transitions=(),
        review_transitions=(),
        presentation=_SAFETY_REPORT_PRESENTATION_BY_ROLE[role],
    )
    for role, destination in _SAFETY_REPORT_TARGET_BY_ROLE.items()
)
_FRAME_BY_ID = MappingProxyType(
    {
        **_BASE_FRAME_BY_ID,
        **{frame.id: frame for frame in _SAFETY_REPORT_FRAMES},
    }
)
_BASE_SHELL_ACTIONS = (
    ShellAction(
        kind=ShellActionKind.STATUS,
        label="Synthetic study · fictional people only",
        target_id=None,
        audiences=PRODUCT_ROLES,
    ),
    ShellAction(
        kind=ShellActionKind.NAVIGATION,
        label="Back to frame atlas",
        target_id=ATLAS_TARGET,
        audiences=PRODUCT_ROLES,
    ),
)
_SAFETY_SHELL_ACTIONS = tuple(
    ShellAction(
        kind=ShellActionKind.SAFETY,
        label="Safety",
        target_id=destination,
        audiences=frozenset({role}),
    )
    for role, destination in _SAFETY_REPORT_TARGET_BY_ROLE.items()
)
_VIEWER_PREVIEW_SHELL_ACTIONS = (
    ShellAction(
        kind=ShellActionKind.WITHDRAWAL,
        label="Withdraw preview consent",
        target_id=ATLAS_TARGET,
        audiences=frozenset({Role.VIEWER}),
        guard=TransitionGuard.PREVIEW_ENTERED,
    ),
)
_ATLAS_REVIEW_TRANSITIONS = (
    _review(
        "Back to frame atlas",
        ATLAS_TARGET,
        TransitionGuard.RETURN_NAVIGATION,
    ),
)


def all_frames() -> tuple[Frame, ...]:
    """Return the immutable catalog in source inventory order."""

    return _FRAMES


def routable_frames() -> tuple[Frame, ...]:
    """Return atlas frames plus catalog-owned context-specific static variants."""

    return _FRAMES + _SAFETY_REPORT_FRAMES


def safety_report_frames() -> tuple[Frame, ...]:
    """Return role-specific report-preview destinations in product-role order."""

    return _SAFETY_REPORT_FRAMES


def safety_report_target_for(role: Role) -> str:
    """Return the role-safe report-preview destination for one product role."""

    return _SAFETY_REPORT_TARGET_BY_ROLE[role]


def get_frame(frame_id: str) -> Frame:
    """Return one atlas frame or static variant by exact identifier."""

    return _FRAME_BY_ID[frame_id]


def frames_for_role(role: Role) -> tuple[Frame, ...]:
    """Return the frames owned by one role."""

    return tuple(frame for frame in _FRAMES if frame.role is role)


def fixed_end_terminal_precedence() -> tuple[TerminalResolutionRule, ...]:
    """Return strict fixed-end resolution rules from highest to lowest priority."""

    return _FIXED_END_TERMINAL_PRECEDENCE


def review_transitions_for(frame_id: str) -> tuple[Action, ...]:
    """Return review-only links that must not render as product controls."""

    return get_frame(frame_id).review_transitions + _ATLAS_REVIEW_TRANSITIONS


def transitions_for(
    frame_id: str,
    *,
    kind: TransitionKind | None = None,
) -> tuple[Action, ...]:
    """Return declared transitions, optionally filtered by ownership kind."""

    transitions = get_frame(frame_id).transitions + _ATLAS_REVIEW_TRANSITIONS
    if kind is None:
        return transitions
    return tuple(transition for transition in transitions if transition.kind is kind)


def shell_actions_for(frame_id: str, audience: Role) -> tuple[ShellAction, ...]:
    """Return ordered persistent shell metadata for one role and frame."""

    frame = get_frame(frame_id)
    presentation = frame.presentation
    if presentation is None or audience is not presentation.audience:
        return ()

    shell_actions = tuple(
        action for action in _BASE_SHELL_ACTIONS if action.applies_to(audience)
    )
    if (
        presentation.current_shell is not None
        and presentation.current_shell.applies_to(audience)
    ):
        shell_actions += (presentation.current_shell,)
    if presentation.context is not SurfaceContext.ORDINARY_APP:
        shell_actions += tuple(
            action
            for action in _SAFETY_SHELL_ACTIONS
            if action.applies_to(audience)
        )
    if audience is Role.VIEWER:
        shell_actions += _VIEWER_PREVIEW_SHELL_ACTIONS
    return shell_actions


def frame_actions_for(frame_id: str, audience: Role) -> tuple[Action, ...]:
    """Return ordered frame-body controls, excluding persistent shell items."""

    frame = get_frame(frame_id)
    presentation = frame.presentation
    if presentation is None or presentation.audience is Role.CROSS_ROLE:
        return ()
    expected_kinds = {TransitionKind.USER}
    if audience is Role.FACILITATOR:
        expected_kinds.add(TransitionKind.FACILITATOR)
    shell_labels = {
        action.label for action in shell_actions_for(frame_id, audience)
    }
    return tuple(
        action.resolved_for(audience)
        for action in frame.actions
        if action.kind in expected_kinds and action.applies_to(audience)
        and action.label not in shell_labels
    )


def product_controls_for(frame_id: str, audience: Role) -> tuple[Action, ...]:
    """Compatibility alias for ordered frame-body controls only."""

    return frame_actions_for(frame_id, audience)


__all__ = [
    "ATLAS_TARGET",
    "Action",
    "ActionIntent",
    "ActionScope",
    "AudienceDestination",
    "ChoiceGroupData",
    "ChoiceInputKind",
    "ChoiceOptionData",
    "ContractData",
    "ContentBlock",
    "ContinuationClass",
    "ConversationData",
    "ConversationMessageData",
    "EvidenceData",
    "EvidenceOptionData",
    "EXTERNAL_CAPTURE_COPY",
    "Frame",
    "PanelData",
    "PARTICIPANT_ROLES",
    "Phase",
    "ProfileData",
    "PRODUCT_ROLES",
    "Role",
    "SafetyReportDestination",
    "ShellAction",
    "ShellActionKind",
    "StatusData",
    "SurfaceContext",
    "SurfaceKind",
    "SurfacePresentation",
    "TerminalClass",
    "TerminalResolutionCondition",
    "TerminalResolutionRule",
    "TransitionGuard",
    "TransitionKind",
    "TextControlData",
    "all_frames",
    "frames_for_role",
    "fixed_end_terminal_precedence",
    "frame_actions_for",
    "get_frame",
    "product_controls_for",
    "routable_frames",
    "review_transitions_for",
    "safety_report_frames",
    "safety_report_target_for",
    "shell_actions_for",
    "transitions_for",
]
